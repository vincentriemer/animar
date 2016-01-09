import config from './rollup.config.js';

config.format = 'umd';
config.dest = 'dist/animar.js';
config.moduleName = 'Animar';

export default config;
