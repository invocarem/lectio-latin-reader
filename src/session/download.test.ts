import { blobToBase64, downloadBytes, type DownloadHost } from "./download";

function host(native: boolean): DownloadHost & { nativeCalls: string[]; webCalls: string[] } {
  const nativeCalls: string[] = [];
  const webCalls: string[] = [];
  return {
    native,
    nativeCalls,
    webCalls,
    saveNative: async (filename) => {
      nativeCalls.push(filename);
    },
    saveWeb: (filename) => {
      webCalls.push(filename);
    },
  };
}

describe("downloadBytes", () => {
  test("a phone opens the share sheet instead of a browser download", async () => {
    const target = host(true);
    await downloadBytes("session-cursus-2026-10-01.json", new Blob(["{}"]), target);
    expect(target.nativeCalls).toEqual(["session-cursus-2026-10-01.json"]);
    expect(target.webCalls).toEqual([]);
  });

  test("the browser keeps the download link", async () => {
    const target = host(false);
    await downloadBytes("session-cursus-2026-10-01.json", new Blob(["{}"]), target);
    expect(target.webCalls).toEqual(["session-cursus-2026-10-01.json"]);
    expect(target.nativeCalls).toEqual([]);
  });
});

describe("blobToBase64", () => {
  test("round-trips the file bytes", async () => {
    const text = '{"work":"cursus"}';
    const encoded = await blobToBase64(new Blob([text]));
    expect(Buffer.from(encoded, "base64").toString("utf8")).toBe(text);
  });
});
