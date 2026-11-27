# Security Policy

## Sensitive telemetry

Telemetry must be treated as potentially sensitive data. Apply data minimization and redaction before export. Never emit credentials, authorization headers, personal identifiers, identity documents, payment details, or raw provider payloads.

## Access and retention

Production observability backends require role-based access, audit logging, retention controls, encryption in transit and at rest, and a documented incident process.

## Availability

Telemetry export should not block core business requests. Use bounded buffers and timeouts. Do not silently discard security-critical audit events; route them through a separately approved durable audit system.

## Reporting

Report security issues through the organization's approved private security reporting channel.
