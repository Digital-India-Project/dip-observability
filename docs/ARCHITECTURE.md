# Architecture

## Ownership

DIP Observability defines provider-neutral telemetry models, safe recording interfaces, health-check contracts, and alert evaluation primitives. It does not own application business logic, security authorization, infrastructure provisioning, production log storage, or monitoring dashboards.

## Data flow

1. A service creates structured telemetry with a stable service name and environment.
2. Sensitive values are removed before telemetry leaves the service boundary.
3. A configured exporter sends telemetry to an approved observability backend.
4. Dashboards and alerting systems consume aggregated metrics and traces.

No production exporter or backend is configured by this foundation.

## Standards compatibility

Keep interfaces compatible with OpenTelemetry concepts for logs, metrics, traces, resource attributes, and context propagation. Avoid inventing proprietary semantics where established conventions exist.

## Reliability

Telemetry must not break business operations. Production exporters should use bounded queues, timeouts, backpressure, sampling, and a fail-open or fail-closed policy explicitly chosen for each signal. Security audit records may require a separate durable channel and must not be silently dropped.
