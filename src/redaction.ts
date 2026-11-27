const SENSITIVE_KEY = /(authorization|cookie|password|secret|token|api.?key|private.?key|credential|connection.?string|aadhaar|aadhar|pan|gstin|email|phone|mobile|address|date.?of.?birth)/i;
const BEARER = /\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

export function redactTelemetry<T>(input: T): T {
  if (Array.isArray(input)) return input.map((value) => redactTelemetry(value)) as T;
  if (typeof input === "string") return input.replace(BEARER, "Bearer [REDACTED]").replace(EMAIL, "[REDACTED_EMAIL]") as T;
  if (!input || typeof input !== "object") return input;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    result[key] = SENSITIVE_KEY.test(key) ? "[REDACTED]" : redactTelemetry(value);
  }
  return result as T;
}
