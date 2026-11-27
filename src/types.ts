export type LogLevel = "debug" | "info" | "warn" | "error";
export type MetricKind = "counter" | "gauge" | "histogram";

export interface TelemetryContext {
  service: string;
  environment: "development" | "test" | "staging" | "production";
  requestId?: string;
  traceId?: string;
  spanId?: string;
  tenantRef?: string;
}

export interface LogRecord {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: TelemetryContext;
  attributes?: Record<string, unknown>;
  error?: { name: string; message: string; code?: string };
}

export interface Logger {
  log(record: LogRecord): void;
}

export interface MetricPoint {
  name: string;
  kind: MetricKind;
  value: number;
  unit?: string;
  timestamp: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface MetricsRecorder {
  record(point: MetricPoint): void;
}

export interface SpanRecord {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startedAt: string;
  durationMs: number;
  status: "ok" | "error";
  attributes?: Record<string, unknown>;
}

export interface TraceRecorder {
  record(span: SpanRecord): void;
}

export interface HealthCheckResult {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  checkedAt: string;
  durationMs: number;
  details?: Record<string, string | number | boolean>;
}

export interface HealthCheck {
  name: string;
  check(): Promise<Omit<HealthCheckResult, "name" | "checkedAt" | "durationMs">>;
}

export interface AlertRule {
  id: string;
  metricName: string;
  comparison: "gt" | "gte" | "lt" | "lte";
  threshold: number;
  windowSeconds: number;
  severity: "info" | "warning" | "critical";
}
