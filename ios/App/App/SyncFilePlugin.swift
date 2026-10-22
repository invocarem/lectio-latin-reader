import Capacitor
import UniformTypeIdentifiers

/// Opens once, then reads and writes the same security-scoped folder on later launches.
/// The folder holds `lectio-sessions.json` and a `notes` directory.
@objc(SyncFilePlugin)
public class SyncFilePlugin: CAPPlugin, CAPBridgedPlugin, UIDocumentPickerDelegate {
    public let identifier = "SyncFilePlugin"
    public let jsName = "SyncFile"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "ready", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pick", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "read", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "write", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "listNotes", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "writeNote", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removeNote", returnType: CAPPluginReturnPromise),
    ]

    private let bookmarkKey = "lectio.sync.bookmark"
    private var pickCall: CAPPluginCall?

    @objc func ready(_ call: CAPPluginCall) {
        guard let url = resolveBookmark(), isFolder(url) else {
            call.resolve(["state": "none"])
            return
        }
        call.resolve(["state": "ready", "name": url.lastPathComponent])
    }

    @objc func pick(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let viewController = self.bridge?.viewController else {
                call.reject("The document picker is not available.")
                return
            }
            self.pickCall?.reject("cancel")
            self.pickCall = call
            let picker = UIDocumentPickerViewController(forOpeningContentTypes: [UTType.folder])
            picker.allowsMultipleSelection = false
            picker.delegate = self
            viewController.present(picker, animated: true)
        }
    }

    @objc func read(_ call: CAPPluginCall) {
        withFolderFile(call, name: "lectio-sessions.json", write: nil, missingIsEmpty: true)
    }

    @objc func write(_ call: CAPPluginCall) {
        guard let text = call.getString("text") else {
            call.reject("Missing text.")
            return
        }
        withFolderFile(call, name: "lectio-sessions.json", write: text, missingIsEmpty: false)
    }

    @objc func listNotes(_ call: CAPPluginCall) {
        let root: URL
        do {
            root = try resolvedFolder()
        } catch {
            call.reject(error.localizedDescription)
            return
        }
        let started = root.startAccessingSecurityScopedResource()
        let notes = root.appendingPathComponent("notes", isDirectory: true)
        if !FileManager.default.fileExists(atPath: notes.path) {
            if started { root.stopAccessingSecurityScopedResource() }
            call.resolve(["files": []])
            return
        }
        coordinate(notes, write: false, root: root, started: started, call: call) { url in
            let children = try FileManager.default.contentsOfDirectory(
                at: url,
                includingPropertiesForKeys: [.isDirectoryKey]
            )
            var files: [[String: String]] = []
            for child in children {
                let values = try child.resourceValues(forKeys: [.isDirectoryKey])
                if values.isDirectory == true { continue }
                let name = child.lastPathComponent
                if !Self.safeNoteName(name) { continue }
                let text = try String(contentsOf: child, encoding: .utf8)
                files.append(["name": name, "text": text])
            }
            return ["files": files] as [String: Any]
        }
    }

    @objc func writeNote(_ call: CAPPluginCall) {
        guard let name = call.getString("name"), let text = call.getString("text"), Self.safeNoteName(name) else {
            call.reject("Missing note.")
            return
        }
        withFolderFile(call, name: name, write: text, missingIsEmpty: false, inNotes: true)
    }

    @objc func removeNote(_ call: CAPPluginCall) {
        guard let name = call.getString("name"), Self.safeNoteName(name) else {
            call.reject("Missing note.")
            return
        }
        let root: URL
        do {
            root = try resolvedFolder()
        } catch {
            call.reject(error.localizedDescription)
            return
        }
        let started = root.startAccessingSecurityScopedResource()
        let file = root.appendingPathComponent("notes", isDirectory: true).appendingPathComponent(name)
        if !FileManager.default.fileExists(atPath: file.path) {
            if started { root.stopAccessingSecurityScopedResource() }
            call.resolve()
            return
        }
        coordinate(file, write: true, root: root, started: started, call: call) { url in
            try FileManager.default.removeItem(at: url)
            return nil
        }
    }

    /**
     * Reads or writes one file inside the bookmarked folder.
     * `name` is `lectio-sessions.json`, or a file inside `notes/` when `inNotes` is set.
     * Capacitor runs plugin methods on the main thread. The synchronous
     * coordinate methods can deadlock that thread, so the accessor runs
     * on a background queue.
     */
    private func withFolderFile(
        _ call: CAPPluginCall,
        name: String,
        write text: String?,
        missingIsEmpty: Bool,
        inNotes: Bool = false
    ) {
        let root: URL
        do {
            root = try resolvedFolder()
        } catch {
            call.reject(error.localizedDescription)
            return
        }
        let started = root.startAccessingSecurityScopedResource()
        let file: URL
        if inNotes {
            let notes = root.appendingPathComponent("notes", isDirectory: true)
            try? FileManager.default.createDirectory(at: notes, withIntermediateDirectories: true)
            file = notes.appendingPathComponent(name)
        } else {
            file = root.appendingPathComponent(name)
        }
        if text == nil && missingIsEmpty && !FileManager.default.fileExists(atPath: file.path) {
            if started { root.stopAccessingSecurityScopedResource() }
            call.resolve(["text": ""])
            return
        }
        coordinate(file, write: text != nil, root: root, started: started, call: call) { url in
            if let text {
                try text.write(to: url, atomically: false, encoding: .utf8)
                return nil
            }
            let contents = try String(contentsOf: url, encoding: .utf8)
            return ["text": contents]
        }
    }

    private func coordinate(
        _ url: URL,
        write: Bool,
        root: URL,
        started: Bool,
        call: CAPPluginCall,
        body: @escaping (URL) throws -> [String: Any]?
    ) {
        let intent: NSFileAccessIntent = write
            ? .writingIntent(with: url)
            : .readingIntent(with: url)
        let coordinator = NSFileCoordinator()
        let queue = OperationQueue()
        queue.name = "lectio.sync.file"
        queue.maxConcurrentOperationCount = 1
        coordinator.coordinate(with: [intent], queue: queue) { [coordinator, queue] error in
            withExtendedLifetime((coordinator, queue)) {}
            defer {
                if started { root.stopAccessingSecurityScopedResource() }
            }
            if let error {
                DispatchQueue.main.async { call.reject(error.localizedDescription) }
                return
            }
            do {
                let result = try body(intent.url)
                DispatchQueue.main.async {
                    if let result { call.resolve(result) } else { call.resolve() }
                }
            } catch {
                DispatchQueue.main.async { call.reject(error.localizedDescription) }
            }
        }
    }

    private static func safeNoteName(_ name: String) -> Bool {
        if name.isEmpty || name.hasPrefix(".") { return false }
        if name.contains("/") || name.contains("\\") || name.contains("..") { return false }
        return true
    }

    private func isFolder(_ url: URL) -> Bool {
        let started = url.startAccessingSecurityScopedResource()
        defer { if started { url.stopAccessingSecurityScopedResource() } }
        var isDirectory: ObjCBool = false
        return FileManager.default.fileExists(atPath: url.path, isDirectory: &isDirectory) && isDirectory.boolValue
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

    private func resolvedFolder() throws -> URL {
        guard let url = resolveBookmark(), isFolder(url) else {
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
            return "Choose the sync folder first."
        }
    }
}

class LectioBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(SyncFilePlugin())
    }
}
