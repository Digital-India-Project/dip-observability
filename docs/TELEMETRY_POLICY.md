# Telemetry Policy

## Allowed data

Prefer service name, environment, operation name, status category, duration, coarse error code, and bounded dimensions.

## Prohibited data

Never record passwords, API keys, tokens, cookies, private keys, Aadhaar, PAN, GSTIN, identity document contents, uploaded files, raw payment credentials, bank account details, full email addresses, phone numbers, residential addresses, raw HTTP request/response bodies, or secret-bearing connection strings.

## Cardinality

Metric labels must be bounded. Do not use request IDs, user IDs, application IDs, document IDs, or arbitrary provider messages as metric labels. Use trace/log correlation for high-cardinality identifiers with approved privacy controls.

## Retention

Each production signal must have a documented retention period, access policy, data residency assessment, and deletion process. This package does not set retention for an external backend.
