import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';

export default {
  entry: 'src/index.js',
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    babel({
      babelrc: false,
      presets: ['es2015-rollup', 'stage-0'],
      plugins: ['syntax-flow', 'transform-flow-strip-types', 'transform-class-properties'],
      exclude: ['node_modules/seamless-immutable/**']
    }),
    commonjs(),
    nodeResolve({ jsnext: true, main: true, browser: true }),
  ]
};
