import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 10000,
    allowedHosts: ["online-platform-t3xm.onrender.com"], // ← добавь сюда Render-домен
  },
});
