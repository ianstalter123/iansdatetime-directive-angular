// Require gulp and plugins
var gulp = require('gulp'),
  jshint = require('gulp-jshint');

var paths = {
  scripts: ['./app/components/date/*.js'],
}


// Define file sources


gulp.task('lint', function(done) {
  return gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
});
// Task to compile SASS files
gulp.task('sass', function() {
  gulp.src(sassMain) // use sassMain file source
    .pipe(sass({
        outputStyle: 'compressed' // Style of compiled CSS
      })
      .on('error', gutil.log)) // Log descriptive errors to the terminal
    .pipe(gulp.dest('assets/css')); // The destination for the compiled file
});


// Task to concatenate and uglify js files
gulp.task('concat', function() {
  gulp.src(jsSources) // use jsSources
    .pipe(concat('script.js')) // Concat to a file named 'script.js'
    .pipe(uglify()) // Uglify concatenated file
    .pipe(gulp.dest('assets/js')); // The destination for the concatenated and uglified file
});


// Task to watch for changes in our file sources
gulp.task('watch', function() {
  gulp.watch(sassMain, ['sass']); // If any changes in 'sassMain', perform 'sass' task
  gulp.watch(sassSources, ['sass']);
  gulp.watch(jsSources, ['concat']);
});


// Default gulp task
gulp.task('default', ['sass', 'concat', 'watch']);
