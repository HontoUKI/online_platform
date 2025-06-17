import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config(); // Загрузим .env в process.env

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 10000,
    allowedHosts: process.env.VITE_ALLOWED_HOSTS?.split(',') || [],
  },
});
