import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const packageRoot = fileURLToPath(new URL('.', import.meta.url));
const srcRoot = resolve(packageRoot, 'src');

export default defineConfig({
  root: srcRoot,
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      '@': srcRoot,
      '@app': resolve(srcRoot, 'app'),
      '@components': resolve(srcRoot, 'components'),
      '@shared': resolve(srcRoot, 'shared'),
    },
  },
  build: {
    outDir: resolve(packageRoot, 'dist'),
    emptyOutDir: true,
    target: 'es2022',
  },
});
