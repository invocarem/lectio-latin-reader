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
     * Reads or writes the sync file under a security-scoped bookmark, using
     * the asynchronous `NSFileCoordinator` API. Capacitor runs plugin methods
     * on the main thread, but the synchronous `coordinate(...)` variants block
     * and can deadlock when called there; the `byAccessor`/`completionHandler`
     * variants do the I/O off the main thread and the call is settled on it.
     */
    private func withFile(_ call: CAPPluginCall, write: Bool, text: String? = nil) {
        do {
            let url = try resolvedBookmark()
            // Stay in the security scope until the coordinated I/O finishes.
            let started = url.startAccessingSecurityScopedResource()

            let coordinator = NSFileCoordinator()
            var finished = false
            let settle: (Result<Any?, Error>) -> Void = { result in
                guard !finished else { return }
                finished = true
                if started { url.stopAccessingSecurityScopedResource() }
                DispatchQueue.main.async {
                    switch result {
                    case .success(let value):
                        if let dict = value as? [String: Any] { call.resolve(dict) }
                        else { call.resolve() }
                    case .failure(let error):
                        call.reject(error.localizedDescription)
                    }
                }
            }

            let accessor: (URL) -> Void = { item in
                do {
                    if let text {
                        try text.write(to: item, atomically: false, encoding: .utf8)
                        settle(.success(nil))
                    } else {
                        settle(.success(["text": try String(contentsOf: item, encoding: .utf8)]))
                    }
                } catch {
                    settle(.failure(error))
                }
            }
            let coordinationDone: (Error?) -> Void = { error in
                if let error { settle(.failure(error)) }
            }

            if write {
                coordinator.coordinate(writingItemAt: url, options: [], byAccessor: accessor, completionHandler: coordinationDone)
            } else {
                coordinator.coordinate(readingItemAt: url, options: [], byAccessor: accessor, completionHandler: coordinationDone)
            }
        } catch {
            DispatchQueue.main.async { call.reject(error.localizedDescription) }
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
