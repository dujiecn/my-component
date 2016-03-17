var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var shrink = require('gulp-cssshrink');
//var webpack = require('gulp-webpack');
var webpack = require('webpack');

// MD5戳
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');

var config = require('./webpack.config');
gulp.task('webpack', function (callback) {
    ////return gulp.src('c/*.js')
    ////    .pipe(webpack(config))
    ////    .pipe(gulp.dest('./dist/'));
    //

    //gulp.src('./c/*.js')
    //    .pipe(webpack(config))
    //    .pipe(uglify())
    //    .pipe(gulp.dest('./dist'));

    webpack(config,function() {
        callback();
    });
});

gulp.task('release',function() {
    gulp.src('./c/*.bundle.js')
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
    gulp.src('./c/*/index.html')
        .pipe(gulp.dest('./dist'));
});

gulp.task('default',['release']);
// command gulp webpack dest