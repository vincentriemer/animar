// Requirements
var gulp = require('gulp'),
    del = require('del'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    minifycss = require('gulp-minify-css'),
    browserify = require('browserify'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-ruby-sass'),
    express = require('express'),
    tinylr = require('tiny-lr')(),
    connectlr = require('connect-livereload'),
    reactify = require('reactify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    flow = require('gulp-flowtype'),
    jsdoc = require('gulp-jsdoc');

// helper function for notifying livereload of a change
function notifyLiveReload(event) {
    var filename = require('path').relative(__dirname, event.path);
    tinylr.changed({
       body: {
           files: [filename]
       }
    });
}

// Styles
gulp.task('styles', function() {
   return gulp.src('src/styles/style.scss')
       .pipe(sass({style: 'expanded'}))
       .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
       .pipe(gulp.dest('dist/assets/css'))
       .pipe(rename({suffix: '.min'}))
       .pipe(minifycss({keepSpecialComments: 0}))
       .pipe(gulp.dest('dist/assets/css'));
});

// Scripts
gulp.task('scripts', ['typecheck'], function() {
    var bundler = browserify({
      entries: ['./src/scripts/main.js'],
      debug: true,
    });

    return bundler
        .bundle()
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(gulp.dest('dist/assets/js'))
        // Minification
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/js'));
});

// Flow type checking
gulp.task('typecheck', function() {
  return gulp.src('./src/scripts/**')
    .pipe(flow());
});

// Extras
gulp.task('extras', function() {
    gulp.src('src/extras/*')
        .pipe(gulp.dest('dist'));
});

// Pages
gulp.task('pages', function() {
    gulp.src('src/pages/**/*')
        .pipe(gulp.dest('dist'));
});

// LiveReload
gulp.task('livereload', function() {
    tinylr.listen(4002);
});

// Express
gulp.task('express', function() {
    var app = express();
    app.use(connectlr({port: 4002}));
    app.use(express.static('dist'));
    app.listen(4000);
});

// Watch
gulp.task('watch', function() {
    gulp.watch('src/styles/**/*.scss', ['styles']);
    gulp.watch('src/scripts/**/*.js', ['scripts']);
    gulp.watch('src/pages/**/*.html', ['pages']);
    gulp.watch('src/extras/*', ['extras']);
    // inform livereload
    gulp.watch('dist/**/*', notifyLiveReload);
});

// Cleanup
gulp.task('clean', function(cb) {
   del(['dist'], cb);
});

// Default
gulp.task('default', ['clean', 'express', 'livereload', 'watch'], function() {
   gulp.start('pages', 'extras', 'styles', 'scripts');
});