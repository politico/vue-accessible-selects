import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import copy from 'rollup-plugin-copy'
import typescript2 from 'rollup-plugin-typescript2'

import pkg from './package.json'
const external = Object.keys(pkg.peerDependencies || {})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    copy({
      // For now, we only support usage of the styling as SCSS mixins, and thus only need to copy over the SCSS without compilation
      // In the future, we could easily export compiled CSS by request, & perhaps allow for CSS vars replacing SCSS vars for customization in that case
      targets: [{ src: 'src/styles', dest: './' }]
    }),
    typescript2({
      check: false
    })
  ],
  optimizeDeps: {
    disabled: false
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'index',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      input: 'src/index.ts',
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external,
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
