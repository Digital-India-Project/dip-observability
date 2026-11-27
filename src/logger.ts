import { redactTelemetry } from "./redaction.js";
import type { LogRecord, Logger } from "./types.js";

export class SafeLogger implements Logger {
  constructor(private readonly sink: (record: LogRecord) => void) {}

  log(record: LogRecord): void {
    if (!record.context.service) throw new Error("Telemetry service name is required");
    const safe = redactTelemetry(record);
    this.sink(safe);
  }
}

export function createLogRecord(
  level: LogRecord["level"],
  message: string,
  context: LogRecord["context"],
  attributes?: Record<string, unknown>
): LogRecord {
  return {
    timestamp: new Date().toISOString(),
    level,
    message: redactTelemetry(message),
    context,
    ...(attributes === undefined ? {} : { attributes })
  };
}
