#!/bin/sh
webpack --config webpack/config.js
webpack --config webpack/config.versioned.js
webpack --config webpack/config.minified.js
webpack --config webpack/config.versioned.minified.js
