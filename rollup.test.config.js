import multiEntry, { entry } from 'rollup-plugin-multi-entry';
import commonjs from 'rollup-plugin-commonjs';
import npm from 'rollup-plugin-npm';
import babel from 'rollup-plugin-babel';

export default {
  entry,
  format: 'iife',
  moduleName: 'animarTests',
  external: ['describe', 'it', 'chai', 'sinon'],
  sourceMap: true,
  plugins: [
    multiEntry(['test-scripts/browser-test.js', 'test/*.spec.js']),
    babel({ babelrc: false, presets: ['es2015-rollup'] }),
    commonjs({ exclude: ['test/*.spec.js'] }),
    npm({ jsnext: true, main: true })
  ],
  dest: 'browser-test/index.js'
}
