import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@/lib': resolve('src/main/lib'),
        '@/shared': resolve('src/shared')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@': resolve('src/preload')
      }
    }
  },
  renderer: {
    assetsInclude: 'src/renderer/assets/**',
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@/shared': resolve('src/shared'),
        '@/assets': resolve('src/renderer/assets'),
        '@/components': resolve('src/renderer/src/components'),
        '@/hooks': resolve('src/renderer/src/hooks'),
        '@/utils': resolve('src/renderer/src/utils'),
        '@/types': resolve('src/renderer/src/types'),
        '@/contexts': resolve('src/renderer/src/contexts'),
        '@/styles': resolve('src/renderer/src/styles')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
