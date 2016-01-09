import config from './rollup.umd.config.js';
import uglify from 'rollup-plugin-uglify';

config.plugins.push(uglify());
config.dest = 'dist/animar.min.js';

export default config;
