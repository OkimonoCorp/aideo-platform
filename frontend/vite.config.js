import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import svgr from 'vite-plugin-svgr';
import { fileURLToPath, URL } from 'url';

// https://vite.dev/config/
export default defineConfig({
    server: {
        host: '0.0.0.0', // Déjà géré par votre flag --host dans le docker-compose
        allowedHosts: true, // Autorise toutes les connexions entrantes (Cypress)
        // OU si la version de Vite est plus ancienne :
        // strictPort: true,
    },
  plugins: [
      react(),
      tailwindcss(),
      svgr()
  ],
  resolve: {
    alias: {
      // Permet d'utiliser /icons/ et /logo/ dans les imports (pointe vers public/)
      '/icons': fileURLToPath(new URL('./public/icons', import.meta.url)),
      '/logo': fileURLToPath(new URL('./public/logo', import.meta.url)),
    },
  },
})
