// Requirements
var gulp = require('gulp'),
    del = require('del'),
    // autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    // minifycss = require('gulp-minify-css'),
    browserify = require('browserify'),
    // uglify = require('gulp-uglify'),
    // sass = require('gulp-ruby-sass'),
    // express = require('express'),
    // tinylr = require('tiny-lr')(),
    // connectlr = require('connect-livereload'),
    reactify = require('reactify'),
    source = require('vinyl-source-stream'),
    // flow = require('gulp-flowtype'),
    buffer = require('vinyl-buffer');

// Cleanup
gulp.task('clean', function(cb) {
   del(['dist'], cb);
});

// Prepublish
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

// helper function for notifying livereload of a change
// function notifyLiveReload(event) {
//     var filename = require('path').relative(__dirname, event.path);
//     tinylr.changed({
//        body: {
//            files: [filename]
//        }
//     });
// }

// Flow type checking
// gulp.task('typecheck', function() {
//   return gulp.src('./src/scripts/**')
//     .pipe(flow());
// });

// LiveReload
// gulp.task('livereload', function() {
//     tinylr.listen(4002);
// });

// Express
// gulp.task('express', function() {
//     var app = express();
//     app.use(connectlr({port: 4002}));
//     app.use(express.static('dist'));
//     app.listen(4000);
// });

// Watch
// gulp.task('watch', function() {
//     gulp.watch('src/styles/**/*.scss', ['styles']);
//     gulp.watch('src/scripts/**/*.js', ['scripts']);
//     gulp.watch('src/pages/**/*.html', ['pages']);
//     gulp.watch('src/extras/*', ['extras']);
//     // inform livereload
//     gulp.watch('dist/**/*', notifyLiveReload);
// });