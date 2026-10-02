import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

/**
 * Hands a file to the user. The browser saves it with a download link.
 * iOS ignores that link, so the phone writes the file and opens the share sheet.
 */
export type DownloadHost = {
  native: boolean;
  saveNative: (filename: string, bytes: Blob) => Promise<void>;
  saveWeb: (filename: string, bytes: Blob) => void;
};

export async function downloadBytes(
  filename: string,
  bytes: Blob,
  host: DownloadHost = liveHost(),
): Promise<void> {
  if (host.native) await host.saveNative(filename, bytes);
  else host.saveWeb(filename, bytes);
}

function liveHost(): DownloadHost {
  return {
    native: Capacitor.isNativePlatform(),
    saveNative: shareFile,
    saveWeb: clickDownload,
  };
}

/** Write the file and open the share sheet. Dismissing the sheet is not an error. */
export async function shareFile(filename: string, bytes: Blob): Promise<void> {
  const written = await Filesystem.writeFile({
    path: filename,
    data: await blobToBase64(bytes),
    directory: Directory.Cache,
  });
  try {
    await Share.share({
      title: filename,
      files: [written.uri],
    });
  } catch (error) {
    if (isShareCancel(error)) return;
    throw error;
  }
}

export function clickDownload(filename: string, bytes: Blob): void {
  const url = URL.createObjectURL(bytes);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function isShareCancel(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /cancel/i.test(message);
}
