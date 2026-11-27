# DIP Observability

Framework-neutral telemetry contracts and safe observability primitives for Digital India Project.

## Scope

- Structured log records and safe logger wrapper.
- Metrics contracts and input validation.
- Trace and span contracts with ID generation.
- Health check execution.
- Alert rule validation and threshold evaluation.
- Sensitive-data redaction for telemetry.

This repository does not deploy a monitoring backend, collect production telemetry, own service health endpoints, or store logs.

## Development

Requires Node.js 20 or later.

```bash
npm install
npm run typecheck
npm test
npm run build
```

These commands have not yet been executed in this environment.

## Security

Telemetry is a potential data-exfiltration path. Redact secrets and personal data before sending telemetry to any backend. Avoid high-cardinality metric labels, raw request/response bodies, credentials, identity documents, and payment details.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/TELEMETRY_POLICY.md](docs/TELEMETRY_POLICY.md), and [SECURITY.md](SECURITY.md).
