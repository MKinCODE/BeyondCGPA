import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env variables from .env files regardless of prefix
  const env = loadEnv(mode, process.cwd(), '');

  // Support BACKEND_URL, API_URL, or VITE_API_URL from process.env (Vercel) or .env file
  const backendUrl =
    process.env.BACKEND_URL ||
    env.BACKEND_URL ||
    process.env.API_URL ||
    env.API_URL ||
    process.env.SERVER_URL ||
    env.SERVER_URL ||
    process.env.VITE_API_URL ||
    env.VITE_API_URL ||
    '';

  // Support GOOGLE_CLIENT_ID from process.env (Vercel) or .env file (without VITE_ prefix)
  const googleClientId =
    process.env.GOOGLE_CLIENT_ID ||
    env.GOOGLE_CLIENT_ID ||
    process.env.VITE_GOOGLE_CLIENT_ID ||
    env.VITE_GOOGLE_CLIENT_ID ||
    '';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.BACKEND_URL': JSON.stringify(backendUrl),
      'import.meta.env.API_URL': JSON.stringify(backendUrl),
      'import.meta.env.VITE_API_URL': JSON.stringify(backendUrl),
      'import.meta.env.GOOGLE_CLIENT_ID': JSON.stringify(googleClientId),
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(googleClientId),
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendUrl || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});
