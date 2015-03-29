// Node modules
var fs = require('fs'), vm = require('vm'), merge = require('deeply'), chalk = require('chalk'), es = require('event-stream');

// Gulp and plugins
var gulp = require('gulp'), rjs = require('gulp-requirejs-bundler'), concat = require('gulp-concat'), clean = require('gulp-clean'),
    replace = require('gulp-replace'), minifyCSS = require('gulp-minify-css'), uglify = require('gulp-uglify'), htmlreplace = require('gulp-html-replace');


// Concatenates and minifies JS files
gulp.task('js', function() {
  return gulp.src(['src/bower_modules/jquery/dist/jquery.min.js', 
            'src/bower_modules/jquery-mobile-bower/js/jquery.mobile-1.4.5.min.js', 'src/app/*.js'])
          .pipe(concat('app.js'))
          .pipe(uglify())
          .pipe(gulp.dest('./dist/'));
});

// Concatenates CSS files, rewrites relative paths to Bootstrap fonts, copies Bootstrap fonts
gulp.task('css', function () {
    var bowerCss = gulp.src('src/bower_modules/jquery-mobile-bower/css/jquery.mobile-1.4.5.min.css').pipe(minifyCSS({keepBreaks:true})),
        appCss = gulp.src('src/css/*.css').pipe(minifyCSS({keepBreaks:true}));
    return es.concat(bowerCss, appCss).pipe(concat('css.css'))
        .pipe(gulp.dest('./dist/'));
});

// Copies index.html, replacing <script> and <link> tags to reference production URLs
gulp.task('html', function() {
    return gulp.src('./src/index.html')
        .pipe(htmlreplace({
            'css': 'css.css',
            'js': 'app.js'
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('new', function() {
    return gulp.src('./src/new.html')
        .pipe(htmlreplace({
            'css': 'css.css',
            'js': 'app.js'
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('view', function() {
    return gulp.src('./src/view.html')
        .pipe(htmlreplace({
            'css': 'css.css',
            'js': 'app.js'
        }))
        .pipe(gulp.dest('./dist/'));
});

// Removes all files from ./dist/
gulp.task('clean', function() {
    return gulp.src('./dist/**/*', { read: false })
        .pipe(clean());
});

gulp.task('default', ['html', 'new', 'view', 'js', 'css'], function(callback) {
    callback();
    console.log('\nPlaced optimized files in ' + chalk.magenta('dist/\n'));
});
