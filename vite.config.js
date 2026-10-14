import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const isUserSite = repo && repo.endsWith('.github.io');
  const base = process.env.GITHUB_ACTIONS === 'true' && repo && !isUserSite ? `/${repo}/` : '/';
  return { plugins: [react()], base };
});
