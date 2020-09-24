import typescript from 'rollup-plugin-typescript2'
import VuePlugin from 'rollup-plugin-vue'
import copy from 'rollup-plugin-copy'

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
        }),
        copy({
            // For now, we only support usage of the styling as SCSS mixins, and thus only need to copy over the SCSS without compilation
            // In the future, we could easily export compiled CSS by request, & perhaps allow for CSS vars replacing SCSS vars for customization in that case
            targets: [{ src: 'src/styles', dest: './' }]
        })
    ],
};