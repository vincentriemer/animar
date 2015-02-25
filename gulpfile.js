// Requirements
var gulp = require('gulp'),
    del = require('del'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

// Cleanup
gulp.task('clean', function(cb) {
   del(['build', 'coverage'], cb);
});

// npm prepublish
gulp.task('bundle', ['clean'], function() {
  var bundler = browserify();

  bundler.add('./lib/animar.js');

  return bundler
      .bundle()
      .pipe(source('animar.js'))
      .pipe(buffer())
      .pipe(gulp.dest('build'))
      .pipe(uglify())
      .pipe(rename({ suffix: "-min" }))
      .pipe(gulp.dest('build'));
});
