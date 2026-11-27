import type { AlertRule } from "./types.js";

export function validateAlertRule(rule: AlertRule): void {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{1,63}$/.test(rule.id)) throw new Error("Alert rule id is invalid");
  if (!/^[a-zA-Z][a-zA-Z0-9_.]{0,127}$/.test(rule.metricName)) throw new Error("Metric name is invalid");
  if (!Number.isFinite(rule.threshold)) throw new Error("Alert threshold must be finite");
  if (!Number.isInteger(rule.windowSeconds) || rule.windowSeconds < 1 || rule.windowSeconds > 86_400) {
    throw new Error("Alert window must be between 1 and 86400 seconds");
  }
}

export function evaluateThreshold(value: number, rule: AlertRule): boolean {
  validateAlertRule(rule);
  if (!Number.isFinite(value)) throw new Error("Observed value must be finite");
  switch (rule.comparison) {
    case "gt": return value > rule.threshold;
    case "gte": return value >= rule.threshold;
    case "lt": return value < rule.threshold;
    case "lte": return value <= rule.threshold;
  }
}
