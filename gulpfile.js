// Requirements
var gulp = require('gulp'),
    del = require('del'),
    rename = require('gulp-rename'),
    browserify = require('browserify'),
    reactify = require('reactify'),
    source = require('vinyl-source-stream'),
    flow = require('gulp-flowtype'),
    buffer = require('vinyl-buffer'),
    react = require('gulp-react');

gulp.task('hook', function() {
  return gulp.src('.pre-commit')
    .pipe(rename('pre-commit'))
    .pipe(gulp.dest('.git/hooks/'));
});

// Flow type checking
gulp.task('typecheck', function() {
  return gulp.src('lib/animator.jsx')
    .pipe(flow());
});

// Cleanup
gulp.task('clean', function(cb) {
   del(['dist', 'lib_js'], cb);
});

// pre-compile javascript for Code Climate
gulp.task('prepareClimate', ['clean'], function() {
  return gulp.src('lib/*.jsx')
    .pipe(react({harmony: true, stripTypes: true}))
    .pipe(rename(function(path) {
      path.extname = ".js";
    }))
    .pipe(gulp.dest("lib_js"));
});

// npm prepublish
gulp.task('prepublish', ['prepareClimate'], function() {
  var bundler = browserify({
    entries: ['./lib/animator.jsx'],
    extensions: ['.jsx']
  });

  return bundler
    .bundle()
    .pipe(source('animator.jsx'))
    .pipe(buffer())
    .pipe(rename('animar.js'))
    .pipe(gulp.dest('dist'));
});