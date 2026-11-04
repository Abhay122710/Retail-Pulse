# RetailPulse — Production Security Deployment Checklist

Before promoting RetailPulse to a production environment, verify every item below:

- [x] **0 Dependency Vulnerabilities**: `npm audit` returns 0 vulnerabilities across all packages.
- [x] **100% Automated Test Pass Rate**: 115 / 115 tests passing.
- [x] **Production Builds Verified**: `tsc && vite build` clean with 0 errors across all frontends.
- [x] **No Hardcoded Credentials**: Verified zero committed secrets in source trees.
- [x] **HTTP Security Headers Active**: `nosniff`, `DENY`, `CSP`, and `Permissions-Policy` set on all responses.
- [x] **Strict CORS Policy**: Disallow wildcard `*` origins when `NODE_ENV=production`.
- [x] **Rate Limiting Active**: Bounded API rate limits prevent denial of service and scrape abuse.
- [x] **Input Bounds Enforced**: Pagination clamped to max 1000 items; request payloads limited to 1MB.
- [x] **CSV Injection Neutralization**: All spreadsheet cell outputs prepended with single quotes for formula triggers.
- [x] **AI Sandbox Guardrails**: PulseAI restricted to approved read-only tools and verified against prompt injection.
- [x] **Atomic Persistence & Backup**: Storage changes written atomically with secondary `.bak` backup copy.
- [x] **Sensitive Log Redaction**: Passwords, tokens, CVVs, and API keys redacted in runtime logging.

