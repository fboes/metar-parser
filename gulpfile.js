'use strict';

// Include gulp
const gulp = require('gulp');
const pkg  = require('./package.json');
const beep = require('beeper');
const onError = function() {
  beep();
  return true;
};

// Include Our Plugins
const eslint       = require('gulp-eslint');
const mocha        = require('gulp-mocha');
const plumber      = require('gulp-plumber');


const tasks = {
  doEslint: function() {
    return gulp.src(
      [
        '*.js',
        pkg.directories.lib + '/**/*.js',
        pkg.directories.test + '/**/*.js'
      ])
      .pipe(plumber({errorHandler: onError}))
      .pipe(eslint())
      .pipe(eslint.format())
      //.pipe(eslint.failAfterError())
    ;
  },

  doMocha: function() {
    return gulp.src(pkg.directories.test + '/**/*.js', {read: false})
      .pipe(plumber({errorHandler: onError}))
      .pipe(mocha({
        reporter: 'dot'
      }))
    ;
  },

  // Watch Files For Changes
  watch: function() {
    gulp.watch(['gulpfile.js', 'package.json'], process.exit);
    gulp.watch(
      [
        '*.js',
        pkg.directories.lib + '/**/*.js',
        pkg.directories.test + '/**/*.js'
      ],
      tasks.test
    );
  }
};

// Bundle tasks
tasks.test = gulp.parallel(tasks.doEslint, tasks.doMocha);

// Expose tasks
gulp.task('test',     tasks.test);
gulp.task('watch',    tasks.watch);
gulp.task('default',  tasks.watch);
