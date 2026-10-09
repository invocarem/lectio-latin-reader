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
        do {
            let text = try withBookmark { url in
                try self.coordinate(url, writing: false) { item in
                    try String(contentsOf: item, encoding: .utf8)
                }
            }
            call.resolve(["text": text])
        } catch {
            call.reject(error.localizedDescription)
        }
    }

    @objc func write(_ call: CAPPluginCall) {
        guard let text = call.getString("text") else {
            call.reject("Missing text.")
            return
        }
        do {
            try withBookmark { url in
                try self.coordinate(url, writing: true) { item in
                    try text.write(to: item, atomically: false, encoding: .utf8)
                }
            }
            call.resolve()
        } catch {
            call.reject(error.localizedDescription)
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

    private func withBookmark<T>(_ body: (URL) throws -> T) throws -> T {
        guard let url = resolveBookmark() else {
            throw SyncFileError.missing
        }
        let started = url.startAccessingSecurityScopedResource()
        defer { if started { url.stopAccessingSecurityScopedResource() } }
        return try body(url)
    }

    private func coordinate<T>(_ url: URL, writing: Bool, _ body: (URL) throws -> T) throws -> T {
        var coordinationError: NSError?
        var result: Result<T, Error>?
        let coordinator = NSFileCoordinator()
        let finish: (URL) -> Void = { item in
            result = Result { try body(item) }
        }
        if writing {
            coordinator.coordinate(writingItemAt: url, options: [], error: &coordinationError, byAccessor: finish)
        } else {
            coordinator.coordinate(readingItemAt: url, options: [], error: &coordinationError, byAccessor: finish)
        }
        if let coordinationError { throw coordinationError }
        guard let result else { throw SyncFileError.missing }
        return try result.get()
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
