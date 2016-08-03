import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/index.js',
  plugins: [
    babel({ babelrc: false, presets: ['es2015-rollup', 'stage-0'], plugins: ['syntax-flow', 'transform-flow-strip-types', 'transform-class-properties'] })
  ]
};
