import { describe, expect, it, vi } from "vitest";
import { liveTransport } from "./syncHost";
import type { SyncTransport } from "./sync";

type Stub = SyncTransport & {
  status: ReturnType<typeof vi.fn>;
  choose: ReturnType<typeof vi.fn>;
  prepare: ReturnType<typeof vi.fn>;
  read: ReturnType<typeof vi.fn>;
  write: ReturnType<typeof vi.fn>;
};

function stub(): Stub {
  return {
    status: vi.fn(async () => "none" as const),
    choose: vi.fn(async () => undefined),
    prepare: vi.fn(async () => undefined),
    read: vi.fn(async () => ""),
    write: vi.fn(async () => undefined),
  };
}

function setup(hasService: boolean) {
  const file = stub();
  const service = stub();
  const onFileChosen = vi.fn();
  const t = liveTransport({ file, service, hasService: () => hasService, onFileChosen });
  return { file, service, onFileChosen, t };
}

describe("liveTransport routing", () => {
  it("routes status/read/prepare/write to the service when a service is saved", async () => {
    const { t, file, service } = setup(true);
    await t.status();
    await t.read();
    await t.prepare();
    await t.write("{}");
    expect(service.status).toHaveBeenCalledTimes(1);
    expect(service.read).toHaveBeenCalledTimes(1);
    expect(service.prepare).toHaveBeenCalledTimes(1);
    expect(service.write).toHaveBeenCalledTimes(1);
    expect(file.status).not.toHaveBeenCalled();
    expect(file.read).not.toHaveBeenCalled();
    expect(file.prepare).not.toHaveBeenCalled();
    expect(file.write).not.toHaveBeenCalled();
  });

  it("routes to the file when no service is saved", async () => {
    const { t, file, service } = setup(false);
    await t.status();
    await t.read();
    await t.prepare();
    await t.write("{}");
    expect(file.status).toHaveBeenCalledTimes(1);
    expect(file.read).toHaveBeenCalledTimes(1);
    expect(file.prepare).toHaveBeenCalledTimes(1);
    expect(file.write).toHaveBeenCalledTimes(1);
    expect(service.status).not.toHaveBeenCalled();
    expect(service.read).not.toHaveBeenCalled();
    expect(service.prepare).not.toHaveBeenCalled();
    expect(service.write).not.toHaveBeenCalled();
  });

  it("picking a file runs the picker and then clears the saved service", async () => {
    const { t, file, onFileChosen } = setup(true);
    const result = await t.choose();
    expect(result).toBeUndefined();
    expect(file.choose).toHaveBeenCalledTimes(1);
    expect(onFileChosen).toHaveBeenCalledTimes(1);
  });

  it("does not clear the service when the picker is cancelled (choose throws)", async () => {
    const { t, file, onFileChosen } = setup(true);
    file.choose.mockRejectedValueOnce(new Error("cancel"));
    await expect(t.choose()).rejects.toThrow("cancel");
    expect(onFileChosen).not.toHaveBeenCalled();
  });
});
