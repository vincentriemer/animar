// Requirements
var gulp = require('gulp'),
    del = require('del'),
    rename = require('gulp-rename'),
    browserify = require('browserify'),
    reactify = require('reactify'),
    source = require('vinyl-source-stream'),
    flow = require('gulp-flowtype'),
    buffer = require('vinyl-buffer');

// Flow type checking
gulp.task('typecheck', function() {
  return gulp.src('lib/animator.js')
    .pipe(flow());
});

// Cleanup
gulp.task('clean', function(cb) {
   del(['dist'], cb);
});

// npm prepublish
gulp.task('prepublish', ['clean'], function() {
  var bundler = browserify({
    entries: ['./lib/animator.js']
  });

  return bundler
    .bundle()
    .pipe(source('animator.js'))
    .pipe(buffer())
    .pipe(rename('animar.js'))
    .pipe(gulp.dest('dist'));
});