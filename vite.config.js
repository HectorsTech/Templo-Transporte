import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import obfuscator from 'rollup-plugin-obfuscator' // <--- La Trituradora

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    obfuscator({
      global: true,
      options: {
        // Configuración agresiva para que el código sea ilegible
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: true,
        debugProtectionInterval: 4000,
        disableConsoleOutput: true, // Adiós a los console.log chismosos
        identifierNamesGenerator: 'hexadecimal', // Variables tipo _0x5f3e
        log: false,
        numbersToExpressions: true,
        rotateStringArray: true,
        selfDefending: true,
        shuffleStringArray: true,
        splitStrings: true,
        stringArray: true,
        stringArrayEncoding: ['base64', 'rc4'], // Encripta textos como tu contraseña
        stringArrayThreshold: 0.75,
        unicodeEscapeSequence: false
      },
    }),
  ],
})