import typescript from 'rollup-plugin-typescript2'
import VuePlugin from 'rollup-plugin-vue'

import pkg from './package.json'

const external = Object.keys(pkg.peerDependencies || {})

export default {
    input: 'src/index.ts',
    external,
    output: {
        dir: 'dist',
        format: 'es',
    },
    plugins: [
        typescript(),
        VuePlugin({
            css: false
        })
    ],
};