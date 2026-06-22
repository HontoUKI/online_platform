import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react()],
    server: {
      historyApiFallback: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 10000,
      allowedHosts: env.VITE_ALLOWED_HOSTS?.split(',').filter(Boolean) || [],
    },
  };
});
