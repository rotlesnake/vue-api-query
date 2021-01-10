import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import { uglify } from 'rollup-plugin-uglify';
 
const config = {
   input: 'src/index.js',
   output: {
     format: 'umd',
     name: 'dbquery',
   },
   plugins: [commonjs(), resolve(), terser()],

//, uglify()
};
 
export default config;