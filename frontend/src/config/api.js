/**
 * API base URL
 * - npm run dev     → .env.development (localhost)
 * - npm run build   → .env.production (Render backend)
 * - Vercel dashboard env vars override at build time
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
