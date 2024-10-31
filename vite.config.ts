import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import * as path from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      common: path.resolve(__dirname, 'src/common'),
      loadData: path.resolve(__dirname, 'src/loadData'),
      utils: path.resolve(__dirname, 'src/utils'),
      styles: path.resolve(__dirname, 'src/styles'),
      spaceTimeChart: path.resolve(__dirname, 'src/spaceTimeChart'),
      application: path.resolve(__dirname, 'src/application'),
      reducer: path.resolve(__dirname, 'src/reducer'),
      store: path.resolve(__dirname, 'src/store')
    }
  }
});