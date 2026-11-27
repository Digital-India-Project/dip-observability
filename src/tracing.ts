import { randomBytes } from "node:crypto";
import type { SpanRecord, TraceRecorder } from "./types.js";

export function createTraceId(): string {
  return randomBytes(16).toString("hex");
}

export function createSpanId(): string {
  return randomBytes(8).toString("hex");
}

export class SafeTraceRecorder implements TraceRecorder {
  constructor(private readonly sink: (span: SpanRecord) => void) {}

  record(span: SpanRecord): void {
    if (!/^[a-f0-9]{32}$/i.test(span.traceId)) throw new Error("traceId must be 16-byte hexadecimal");
    if (!/^[a-f0-9]{16}$/i.test(span.spanId)) throw new Error("spanId must be 8-byte hexadecimal");
    if (!Number.isFinite(span.durationMs) || span.durationMs < 0) throw new Error("durationMs must be non-negative");
    this.sink(span);
  }
}
