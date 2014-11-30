// Requirements
var gulp = require('gulp'),
    del = require('del'),
    rename = require('gulp-rename'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    flow = require('gulp-flowtype'),
    buffer = require('vinyl-buffer'),
    react = require('gulp-react'),
    istanbul = require('gulp-istanbul'),
    mocha = require('gulp-mocha'),
    exec = require('child_process').exec;

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
   del(['dist', 'lib_js', 'coverage'], cb);
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

// testing
gulp.task('test', ['prepublish', 'typecheck'], function(cb) {
  gulp.src(['lib_js/*.js'])
    .pipe(istanbul())
    .on('finish', function() {
      gulp.src(['test/*.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports())
        .on('end', cb);
    });
});

// task for uploading coverage data to Code Climate
gulp.task('coverage', ['test'], function(cb) {
  exec('CODECLIMATE_REPO_TOKEN=255dcc221d2564fd8a640532bf923db489f6ae8011024b2fdc77600d8d4fc054 codeclimate < coverage/lcov.info', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});