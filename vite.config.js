import { defineConfig } from 'vite';

export default defineConfig({
  // Relative paths: on Android the files are served from capacitor://localhost
  base: './',
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
