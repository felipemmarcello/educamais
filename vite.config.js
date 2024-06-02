import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // todos os módulos na pasta node_modules serão agrupados neste chunk
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Aumentar o limite de aviso de tamanho do chunk para 1000kB
  }
},
)
