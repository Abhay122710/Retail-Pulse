# RetailPulse — Security Remediation & Hardening Log

This document records the exact modifications applied to harden the RetailPulse platform against cybersecurity vulnerabilities.

---

### Remediation Entry 1: Dependency Vulnerability Patching
- **Action**: Ran `npm audit fix` across `retail-pulse-connector`, `RetailPulse`, `Site1`, `TechMart`, and root workspace.
- **Affected Packages**: `body-parser`, `qs`, `vite`.
- **Result**: Vulnerability count dropped to **0 vulnerabilities** across all audited packages.
- **Verification**: `npm audit` returned clean in all module folders.

---

### Remediation Entry 2: Query Limit Hardening
- **File Modified**: `retail-pulse-connector/src/controllers/events.controller.ts`
- **Diff Logic**:
  ```typescript
  const rawLimit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const limit = isNaN(rawLimit) || rawLimit <= 0 ? 50 : Math.min(rawLimit, 1000);
  ```
- **Security Impact**: Eliminates unbounded memory allocation and database exfiltration through malicious high-integer limit parameters.

---

### Remediation Entry 3: Content-Disposition Header Sanitization
- **File Modified**: `retail-pulse-connector/src/controllers/report.controller.ts`
- **Diff Logic**:
  ```typescript
  const rawSection = typeof req.query.section === 'string' ? req.query.section : 'kpis';
  const safeSection = ['products', 'inventory', 'profitability', 'kpis'].includes(rawSection)
    ? rawSection
    : 'kpis';
  ```
- **Security Impact**: Prevents carriage-return / line-feed (CRLF) header injection and arbitrary file naming in browser download headers.

---

### Remediation Entry 4: Python ML Response Security Headers
- **File Modified**: `retailpulse-ml/app/main.py`
- **Diff Logic**:
  ```python
  class SecurityHeadersMiddleware(BaseHTTPMiddleware):
      async def dispatch(self, request: Request, call_next):
          response: Response = await call_next(request)
          response.headers["X-Content-Type-Options"] = "nosniff"
          response.headers["X-Frame-Options"] = "DENY"
          response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
          response.headers["X-XSS-Protection"] = "1; mode=block"
          return response

  app.add_middleware(SecurityHeadersMiddleware)
  ```
- **Security Impact**: Protects Python analytics endpoints against MIME-type sniffing and unauthorized framing.

---

### Remediation Entry 5: Permissions-Policy & Structured Logger Expansion
- **Files Modified**: 
  - `retail-pulse-connector/src/middleware/security.middleware.ts`
  - `retail-pulse-connector/src/utils/logger.ts`
- **Diff Logic**: Added restrictive Permissions-Policy header and added `ssn`, `pin`, `access_token`, `refresh_token` to logger redaction set.
- **Security Impact**: Restricts untrusted browser capability access and protects sensitive personal tokens from appearing in telemetry logs.

