'use strict';

import gulp from 'gulp';
import yargs from 'yargs';
import requireDir from 'require-dir';
import c from 'ansi-colors';

const argv = yargs.argv;
const production = !!argv.production;

if (production) {
  console.log(c.green.bold.underline('🚚 Production mode'));
} else {
  console.log(c.yellow.bold.underline('🔧 Development mode'));
}



const paths = {
  dist: './dist/',
  views: {
    src: './src/views/templates/**/*.html',
    pages: './src/views/templates/',
    helpers: './src/views/helpers/',
    partials: './src/views/partials/',
    data: './src/views/data',
    dist: './dist/',
    watch: './src/views/**/*.{html,hbs}',
  },
  styles: {
    src: './src/styles/*.{scss,sass}',
    dist: './dist/assets/styles/',
    watch: './src/styles/**/*.{scss,sass}',
  },
  fonts: {
    src: './src/fonts/**/*.{woff,woff2,eot,ttf,svg,otf,css}',
    dist: './dist/assets/fonts/',
    watch: './src/fonts/**/*.{woff,woff2,eot,ttf,svg,otf,css}',
  },
  favicons: {
    src: "./src/img/favicon/*.{jpg,jpeg,png,gif}",
    dist: "./dist/assets/img/favicons/",
  },
  sprites: {
    src: "./src/img/svg-sprite/*.svg",
    dist: "./dist/assets/img/svg-sprite/",
    watch: "./src/img/svg-sprite/*.svg"
  },
  images: {
    src: [
      './src/img/**/*.{jpg,jpeg,png,gif,tiff,svg,mp4}',
      '!./src/img/favicon/*',
      '!./src/img/svg-sprite/*',
    ],
    dist: './dist/assets/img/',
    watch: './src/img/**/*.{jpg,jpeg,png,gif,svg,tiff,mp4}',
  },
  scripts: {
    src: './src/js/main.js',
    dist: './dist/assets/js/',
    srcOther: './src/js/other/*.js',
    distOther: './dist/assets/js/other/',
    watch: './src/js/**/*.js',
  },
  vendors: {
    src: './src/vendors/**/*.*',
    dist: './dist/assets/vendors/'
  },
  assets: {
    dist: './dist/assets/',
  },
};

const config = {
  production: production,
  plumber: {
    errorHandler: function(error) {
      console.log(c.red(error.message));
      this.emit('end');
    }
  },
  fileInclude: {
    prefix: '@@',
    basepath: __dirname,
    context: {},
  },
  metadata: {
    author: 'TranTrungTinh',
    year: (new Date()).getFullYear()
  }
};

// -------------------------------------
//   All tasks
// -------------------------------------

requireDir('./tasks/');


// -------------------------------------
//   Task: default
// -------------------------------------

gulp.task('default',
  gulp.series(gulp.parallel('styles', 'scripts', 'images', 'fonts', 'views', 'favicons', 'sprites', 'vendors'), 'server'));


// -------------------------------------
//   Task: build
// -------------------------------------

gulp.task(
  'build',
  gulp.series('clean', gulp.parallel('styles', 'scripts', 'images', 'fonts', 'views', 'favicons', 'sprites', 'vendors'), 'say:build'));

export { paths, config };
