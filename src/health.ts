import type { HealthCheck, HealthCheckResult } from "./types.js";

export async function runHealthCheck(check: HealthCheck): Promise<HealthCheckResult> {
  const started = Date.now();
  try {
    const result = await check.check();
    return {
      name: check.name,
      checkedAt: new Date().toISOString(),
      durationMs: Math.max(0, Date.now() - started),
      ...result
    };
  } catch {
    return {
      name: check.name,
      status: "unhealthy",
      checkedAt: new Date().toISOString(),
      durationMs: Math.max(0, Date.now() - started)
    };
  }
}
