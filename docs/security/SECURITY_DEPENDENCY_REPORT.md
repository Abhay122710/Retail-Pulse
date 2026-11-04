# RetailPulse — Security Dependency Report (SCA)

**Audit Tool**: `npm audit`  
**Total Vulnerabilities Remaining**: **0**

---

## 1. Package Inventory & Status

### A. Central Connector Gateway (`retail-pulse-connector`)
- Direct Dependencies: `cors`, `dotenv`, `express`
- Dev Dependencies: `@types/cors`, `@types/express`, `@types/node`, `tsx`, `typescript`
- Audit Status: **0 vulnerabilities** (Fixed `body-parser` and `qs` transitive vulnerabilities)

### B. RetailPulse BI Dashboard (`RetailPulse`)
- Direct Dependencies: `clsx`, `lucide-react`, `react`, `react-dom`, `tailwind-merge`
- Dev Dependencies: `@tailwindcss/vite`, `@vitejs/plugin-react`, `tailwindcss`, `vite`
- Audit Status: **0 vulnerabilities** (Updated Vite engine)

### C. ShopPulse Demo Storefront (`Site1`)
- Direct Dependencies: `clsx`, `lucide-react`, `react`, `react-dom`, `tailwind-merge`
- Dev Dependencies: `@tailwindcss/vite`, `@vitejs/plugin-react`, `tailwindcss`, `vite`
- Audit Status: **0 vulnerabilities** (Updated Vite engine)

### D. TechMart Storefront (`TechMart`)
- Direct Dependencies: `clsx`, `lucide-react`, `react`, `react-dom`, `tailwind-merge`
- Dev Dependencies: `@tailwindcss/vite`, `@vitejs/plugin-react`, `tailwindcss`, `vite`
- Audit Status: **0 vulnerabilities** (Updated Vite engine)

### E. Python Predictive Service (`retailpulse-ml`)
- Verified Packages: `fastapi`, `uvicorn`, `pydantic`, `pandas`, `numpy`, `scikit-learn`, `statsmodels`, `pytest`, `httpx`, `python-dotenv`
- Audit Status: Clean, no unpinned high-risk native binary extensions.

