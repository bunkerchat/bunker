var gulp = require('gulp');
var usemin = require('gulp-usemin');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var fs = require('fs');
var path = require('path');

gulp.task('usemin', function () {
	return gulp.src('./views/index.ejs')
		.pipe(usemin({
			assetsDir: './',
			css: ['concat'],
			//html: [minifyHtml({empty: true})],
			jsLib:[rev()],
			jsLibMin: [uglify(), rev()],
			jsApp:[ngAnnotate(), uglify(), rev()]
		}))
		.pipe(gulp.dest('./'));
});

gulp.task('move-index-prod', ['usemin'], function (done) {
	fs.rename(
		path.join('index.ejs'),
		path.join('views', 'index-prod.ejs'),
		done);
});

gulp.task('production', ['move-index-prod']);

gulp.task('default', ['production']);