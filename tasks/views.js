'use strict';

import hb from 'gulp-hb';
import gulp from 'gulp';
import gulpIf from 'gulp-if';
import plumber from 'gulp-plumber';
import replace from 'gulp-replace';
import beautify from 'gulp-beautify';
import browsersync from 'browser-sync';
import hbLayouts from 'handlebars-layouts';
import htmlmin from 'gulp-htmlmin'
import { paths, config } from '../gulpfile.babel';


// -------------------------------------
//   Task: views
// -------------------------------------

gulp.task('views', function () {
  let hbStream = hb({
    //debug: true
  })
  .partials(paths.views.partials + '**/*.{hbs,html}')

  // Helpers
  .helpers(hbLayouts)
  .helpers(paths.views.helpers + '/*.js')

  // Data
  .data(paths.views.data + '/**/*.{js,json}')
  .data(config.metadata);
    

  return gulp.src(paths.views.src)
    .pipe(plumber(config.plumber))
    .pipe(hbStream)
    .pipe(beautify.html({
      indent_size: 2, preserve_newlines: false
    }))
    .pipe(gulpIf(config.production, htmlmin({ collapseWhitespace: true })))
    .pipe(gulp.dest(paths.views.dist))
    .on('end', browsersync.reload);
});