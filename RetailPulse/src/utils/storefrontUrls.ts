/**
 * Resolves the storefront URLs for ShopPulse and TechMart.
 * Supports:
 *  1. Environment variable override (VITE_SHOPPULSE_URL / VITE_TECHMART_URL) for multi-domain setups
 *  2. Unified relative routing (/shoppulse/ and /techmart/) in production (Vercel / Cloud deployments)
 *  3. Localhost fallback (ports 3000 and 5174) in local development
 */
export const getStorefrontUrls = () => {
  const isProd = import.meta.env.PROD;
  
  const shoppulseUrl = 
    (import.meta as any).env?.VITE_SHOPPULSE_URL || 
    (isProd ? '/shoppulse/' : 'http://localhost:3000');
    
  const techmartUrl = 
    (import.meta as any).env?.VITE_TECHMART_URL || 
    (isProd ? '/techmart/' : 'http://localhost:5174');

  return {
    shoppulseUrl,
    techmartUrl,
  };
};
