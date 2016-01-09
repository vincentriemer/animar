import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/animar.js',
  plugins: [
    babel({ babelrc: false, presets: ['es2015-rollup'] })
  ]
}
