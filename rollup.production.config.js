import config from './rollup.umd.config.js';
import uglify from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';

config.plugins[0] = replace({
  'process.env.NODE_ENV': JSON.stringify('development')
});
config.plugins.push(uglify());
config.dest = 'dist/animar.min.js';

export default config;
