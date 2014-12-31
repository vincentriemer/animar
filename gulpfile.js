// Requirements
var gulp = require('gulp'),
    del = require('del'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    istanbul = require('gulp-istanbul'),
    mocha = require('gulp-mocha'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

// shim for harmony features
require('es6-shim');

// Cleanup
gulp.task('clean', function(cb) {
   del(['dist', 'coverage'], cb);
});

// npm prepublish
gulp.task('prepublish', ['clean'], function() {
  var bundler = browserify({
    entries: ['./lib/animar.js'],
    extensions: ['.js']
  });

  return bundler
      .bundle()
      .pipe(source('animar.js'))
      .pipe(buffer())
      .pipe(gulp.dest('dist'))
      .pipe(uglify())
      .pipe(rename({ suffix: "-min" }))
      .pipe(gulp.dest('dist'));
});

// testing
gulp.task('test', ['prepublish'], function(cb) {
  gulp.src(['lib/*.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', function() {
      gulp.src(['test/*.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports())
        .on('end', cb);
    });
});
