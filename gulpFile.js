var gulp = require('gulp'),
  connect = require('gulp-connect');

gulp.task('webserver', function() {
  connect.server({
      host: '0.0.0.0'
  });
});

gulp.task('default', ['webserver']);
