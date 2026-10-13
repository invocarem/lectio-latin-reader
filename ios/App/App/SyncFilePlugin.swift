import Capacitor
import UniformTypeIdentifiers

/// Opens once, then reads and writes the same security-scoped file on later launches.
@objc(SyncFilePlugin)
public class SyncFilePlugin: CAPPlugin, CAPBridgedPlugin, UIDocumentPickerDelegate {
    public let identifier = "SyncFilePlugin"
    public let jsName = "SyncFile"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "ready", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pick", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "read", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "write", returnType: CAPPluginReturnPromise),
    ]

    private let bookmarkKey = "lectio.sync.bookmark"
    private var pickCall: CAPPluginCall?

    @objc func ready(_ call: CAPPluginCall) {
        call.resolve(["state": resolveBookmark() == nil ? "none" : "ready"])
    }

    @objc func pick(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let viewController = self.bridge?.viewController else {
                call.reject("The document picker is not available.")
                return
            }
            self.pickCall?.reject("cancel")
            self.pickCall = call
            let picker = UIDocumentPickerViewController(forOpeningContentTypes: [UTType.json])
            picker.allowsMultipleSelection = false
            picker.delegate = self
            viewController.present(picker, animated: true)
        }
    }

    @objc func read(_ call: CAPPluginCall) {
        withFile(call, write: false)
    }

    @objc func write(_ call: CAPPluginCall) {
        guard let text = call.getString("text") else {
            call.reject("Missing text.")
            return
        }
        withFile(call, write: true, text: text)
    }

    /**
     * Reads or writes the sync file under a security-scoped bookmark.
     * Capacitor runs plugin methods on the main thread. The synchronous
     * `coordinate(readingItemAt:...)` methods block that thread until file
     * presenters reply, which can deadlock. `coordinate(with:queue:byAccessor:)`
     * waits in the background and runs the file access on `queue`.
     */
    private func withFile(_ call: CAPPluginCall, write: Bool, text: String? = nil) {
        let url: URL
        do {
            url = try resolvedBookmark()
        } catch {
            call.reject(error.localizedDescription)
            return
        }

        // Stay in the security scope until the coordinated I/O finishes.
        let started = url.startAccessingSecurityScopedResource()
        let intent: NSFileAccessIntent = write
            ? .writingIntent(with: url)
            : .readingIntent(with: url)
        let coordinator = NSFileCoordinator()
        let queue = OperationQueue()
        queue.name = "lectio.sync.file"
        queue.maxConcurrentOperationCount = 1

        // Capture the coordinator and queue so they outlive this method.
        coordinator.coordinate(with: [intent], queue: queue) { [coordinator, queue] error in
            withExtendedLifetime((coordinator, queue)) {}
            defer {
                if started { url.stopAccessingSecurityScopedResource() }
            }
            if let error {
                DispatchQueue.main.async { call.reject(error.localizedDescription) }
                return
            }
            do {
                if let text {
                    try text.write(to: intent.url, atomically: false, encoding: .utf8)
                    DispatchQueue.main.async { call.resolve() }
                } else {
                    let contents = try String(contentsOf: intent.url, encoding: .utf8)
                    DispatchQueue.main.async { call.resolve(["text": contents]) }
                }
            } catch {
                DispatchQueue.main.async { call.reject(error.localizedDescription) }
            }
        }
    }

    public func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        guard let url = urls.first else {
            pickCall?.reject("cancel")
            pickCall = nil
            return
        }
        do {
            let started = url.startAccessingSecurityScopedResource()
            defer { if started { url.stopAccessingSecurityScopedResource() } }
            let data = try url.bookmarkData(options: [], includingResourceValuesForKeys: nil, relativeTo: nil)
            UserDefaults.standard.set(data, forKey: bookmarkKey)
            pickCall?.resolve(["name": url.lastPathComponent])
        } catch {
            pickCall?.reject(error.localizedDescription)
        }
        pickCall = nil
    }

    public func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
        pickCall?.reject("cancel")
        pickCall = nil
    }

    private func resolveBookmark() -> URL? {
        guard let data = UserDefaults.standard.data(forKey: bookmarkKey) else { return nil }
        var stale = false
        guard let url = try? URL(resolvingBookmarkData: data, options: [], relativeTo: nil, bookmarkDataIsStale: &stale) else {
            return nil
        }
        if stale, let fresh = try? url.bookmarkData(options: [], includingResourceValuesForKeys: nil, relativeTo: nil) {
            UserDefaults.standard.set(fresh, forKey: bookmarkKey)
        }
        return url
    }

    private func resolvedBookmark() throws -> URL {
        guard let url = resolveBookmark() else {
            throw SyncFileError.missing
        }
        return url
    }
}

private enum SyncFileError: LocalizedError {
    case missing

    var errorDescription: String? {
        switch self {
        case .missing:
            return "Choose the sync file first."
        }
    }
}

class LectioBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(SyncFilePlugin())
    }
}
