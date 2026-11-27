import test from "node:test";
import assert from "node:assert/strict";
import {
  SafeLogger, createLogRecord, redactTelemetry, ValidatingMetricsRecorder,
  createTraceId, createSpanId, SafeTraceRecorder, runHealthCheck,
  validateAlertRule, evaluateThreshold
} from "../src/index.js";

test("redacts sensitive attributes and bearer tokens in logs", () => {
  const output: unknown[] = [];
  const logger = new SafeLogger((record) => output.push(record));
  logger.log(createLogRecord("info", "request Bearer abc.def", {
    service:"dip-api", environment:"test"
  }, {email:"user@example.com", safe:"ok"}));
  const record = output[0] as {message:string;attributes:Record<string,string>};
  assert.match(record.message, /REDACTED/);
  assert.equal(record.attributes.email, "[REDACTED]");
  assert.equal(record.attributes.safe, "ok");
});

test("redacts nested telemetry payloads", () => {
  const safe = redactTelemetry({nested:[{password:"p", label:"ok"}]});
  assert.equal(safe.nested[0].password, "[REDACTED]");
  assert.equal(safe.nested[0].label, "ok");
});

test("validates metric names, values and attributes", () => {
  const points: unknown[] = [];
  const recorder = new ValidatingMetricsRecorder((point) => points.push(point));
  recorder.record({name:"http.requests",kind:"counter",value:1,timestamp:new Date().toISOString()});
  assert.equal(points.length, 1);
  assert.throws(() => recorder.record({name:"bad metric",kind:"counter",value:1,timestamp:new Date().toISOString()}));
  assert.throws(() => recorder.record({name:"http.requests",kind:"counter",value:-1,timestamp:new Date().toISOString()}));
});

test("generates correctly shaped trace and span identifiers", () => {
  assert.match(createTraceId(), /^[a-f0-9]{32}$/);
  assert.match(createSpanId(), /^[a-f0-9]{16}$/);
});

test("validates spans before sending to sink", () => {
  const spans: unknown[] = [];
  const recorder = new SafeTraceRecorder((span) => spans.push(span));
  recorder.record({
    traceId:"a".repeat(32), spanId:"b".repeat(16), name:"test",
    startedAt:new Date().toISOString(), durationMs:2, status:"ok"
  });
  assert.equal(spans.length, 1);
  assert.throws(() => recorder.record({
    traceId:"bad", spanId:"b".repeat(16), name:"test",
    startedAt:new Date().toISOString(), durationMs:2, status:"ok"
  }));
});

test("converts health check failures into unhealthy results without leaking errors", async () => {
  const result = await runHealthCheck({name:"database", async check() { throw new Error("secret connection string"); }});
  assert.equal(result.status, "unhealthy");
  assert.equal(result.details, undefined);
});

test("validates and evaluates alert thresholds", () => {
  const rule = {id:"high-error-rate",metricName:"http.error_rate",comparison:"gt" as const,threshold:0.05,windowSeconds:300,severity:"warning" as const};
  validateAlertRule(rule);
  assert.equal(evaluateThreshold(0.06, rule), true);
  assert.equal(evaluateThreshold(0.01, rule), false);
});
