import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import obfuscator from 'rollup-plugin-obfuscator' // <--- La Trituradora

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Ofuscación LIGERA para evitar errores con Lazy Loading
    obfuscator({
      global: true,
      options: {
        compact: true,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        debugProtection: false,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: false,
        rotateStringArray: true,
        selfDefending: false,
        shuffleStringArray: true,
        splitStrings: false,
        stringArray: true,
        stringArrayThreshold: 0.5,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Quitamos manualChunks agresivo por ahora para estabilizar
        // Vite ya hace code-splitting automático con los dynamic imports de App.jsx
        manualChunks: undefined
      }
    },
    chunkSizeWarningLimit: 1000
  }
})