import type { MetricPoint, MetricsRecorder } from "./types.js";

const NAME = /^[a-zA-Z][a-zA-Z0-9_.]{0,127}$/;

export class ValidatingMetricsRecorder implements MetricsRecorder {
  constructor(private readonly sink: (point: MetricPoint) => void) {}

  record(point: MetricPoint): void {
    if (!NAME.test(point.name)) throw new Error("Metric name is invalid");
    if (!Number.isFinite(point.value)) throw new Error("Metric value must be finite");
    if (point.kind === "counter" && point.value < 0) throw new Error("Counter values cannot be negative");
    if (!Number.isFinite(Date.parse(point.timestamp))) throw new Error("Metric timestamp is invalid");
    if (point.attributes && Object.keys(point.attributes).length > 20) {
      throw new Error("Metric attribute cardinality exceeds the per-point limit");
    }
    this.sink(point);
  }
}
