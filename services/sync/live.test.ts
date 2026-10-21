/// <reference types="vitest/globals" />

/**
 * Step 3 — one live process. Spawns the real server with its environment and
 * fetches it over the socket, so the run path
 * (`node --experimental-strip-types services/sync/server.ts`) is exercised end
 * to end from the outside, with the file and token coming only from env.
 */

import { spawn, type ChildProcessByStdio } from "node:child_process";
import { once } from "node:events";
import { promises as fs } from "node:fs";
import { request as httpRequest } from "node:http";
import * as os from "node:os";
import * as path from "node:path";
import type { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { etagOf } from "./server";

/** The child shape when stdio is [ignore, pipe, pipe]. */
type ServerChild = ChildProcessByStdio<null, Readable, Readable>;

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
}

function withTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timed out waiting for the server")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** Spawn the server on an ephemeral port and wait for its startup line. */
async function startServer(
  file: string,
  token: string,
): Promise<{ child: ServerChild; port: number }> {
  const child = spawn(process.execPath, ["--experimental-strip-types", "services/sync/server.ts"], {
    cwd: repoRoot(),
    env: {
      ...process.env,
      LECTIO_SYNC_FILE: file,
      LECTIO_SYNC_TOKEN: token,
      LECTIO_SYNC_HOST: "127.0.0.1",
      LECTIO_SYNC_PORT: "0",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stderr = "";
  child.stderr.on("data", (d) => {
    stderr += String(d);
  });
  const port = new Promise<number>((resolve, reject) => {
    let buffer = "";
    child.stdout.on("data", (d) => {
      buffer += String(d);
      const match = /listening on \d+\.\d+\.\d+\.\d+:(\d+)/.exec(buffer);
      if (match) resolve(Number(match[1]));
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      reject(new Error(`server exited early (code ${code}): ${stderr}`)),
    );
  });
  const gotPort = await withTimeout(port);
  return { child, port: gotPort };
}

function request(
  port: number,
  token: string,
  opts: { method: string; headers?: Record<string, string>; body?: string },
): Promise<{ status: number; headers: NodeJS.Dict<string | string[]>; body: string }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      {
        host: "127.0.0.1",
        port,
        method: opts.method,
        path: "/lectio-sessions.json",
        headers: { Authorization: `Bearer ${token}`, ...(opts.headers ?? {}) },
      },
      (res) => {
        const chunks: string[] = [];
        res.setEncoding("utf8");
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({ status: res.statusCode ?? 0, headers: res.headers, body: chunks.join("") }),
        );
      },
    );
    req.on("error", reject);
    if (opts.body !== undefined) req.write(opts.body);
    req.end();
  });
}

async function stop(child: ServerChild): Promise<void> {
  child.kill();
  await once(child, "exit").catch(() => undefined);
}

describe("sync live process (Step 3)", () => {
  it(
    "starts from the environment and serves a GET/PUT round trip",
    async () => {
      const dir = await fs.mkdtemp(path.join(os.tmpdir(), "lectio-sync-live-"));
      const file = path.join(dir, "lectio-sessions.json");
      const token = "live-token-0123456789abcdef";
      const { child, port } = await startServer(file, token);
      try {
        const initial = await request(port, token, { method: "GET" });
        expect(initial.status).toBe(200);
        expect(initial.body).toBe("");
        expect(initial.headers.etag).toBe(etagOf(Buffer.alloc(0)));

        const body = '{"version":1,"sessions":{}}';
        const put = await request(port, token, {
          method: "PUT",
          headers: { "If-Match": String(initial.headers.etag) },
          body,
        });
        expect(put.status).toBe(204);

        const after = await request(port, token, { method: "GET" });
        expect(after.status).toBe(200);
        expect(after.body).toBe(body);
      } finally {
        await stop(child);
        await fs.rm(dir, { recursive: true, force: true });
      }
    },
    15000,
  );
});
