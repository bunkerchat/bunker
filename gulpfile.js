var gulp = require('gulp');
var usemin = require('gulp-usemin');
var ngAnnotate = require('gulp-ng-annotate');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var rev = require('gulp-rev');
var fs = require('fs-extra');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var ngHtml2Js = require("gulp-ng-html2js");
var concat = require("gulp-concat");
var sass = require('gulp-sass');
var filenames = require("gulp-filenames");

gulp.task('sass', function () {
	return gulp.src('./assets/styles/**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', err => {
			sass.logError.bind(this,err);
			throw err;
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./assets/bundled'));
});

gulp.task('clear-build-folder', function (cb) {
	fs.remove(path.join(__dirname, 'assets', 'bundled'), cb)
});

gulp.task('usemin', ['clear-build-folder'], function () {
	return gulp.src('./server/views/index.ejs')
		.pipe(usemin({
			assetsDir: './',
			css: ['concat'],
			sass: [
				sass({
					includePaths: ['./assets/styles']
				}),
				rev()
			],
			//html: [minifyHtml({empty: true})],
			jsLib: [rev()],
			jsLibMin: [uglify(), rev()],
			jsApp: [
				//sourcemaps.init({
				//	loadMaps: true
				//}),
				ngAnnotate(),
				'concat',
				babel({presets: ['@babel/env']}),
				//uglify({mangle:false, compress: false}),
				rev(),
				filenames('bundle')
				//sourcemaps.write('./')
			]
		}))
		.pipe(gulp.dest('./'));
});

gulp.task('template-cache-html', ['clear-build-folder'], function () {
	return gulp.src("./assets/app/**/*.html")
		.pipe(minifyHtml({
			empty: true,
			spare: true,
			quotes: true
		}))
		.pipe(ngHtml2Js({
			moduleName: "bunker",
			prefix: "/assets/app/"
		}))
		.pipe(concat("templates.js"))
		//.pipe(uglify())
		//.pipe(rev())
		.pipe(gulp.dest("./assets/bundled"));
});

gulp.task('merge', ['template-cache-html', 'usemin'], function () {
	var files = filenames.get('bundle');
	files.push("./assets/bundled/templates.js");

	return gulp.src(files)
		.pipe(concat(files[0]))
		.pipe(gulp.dest("./"));
});

gulp.task('move-index-prod', ['merge'], function (done) {
	fs.rename(
		path.join('index.ejs'),
		path.join('server', 'views', 'index-prod.ejs'),
		done);
});

gulp.task('production', ['template-cache-html', 'move-index-prod', 'sass']);

gulp.task('default', ['production']);

gulp.task('watch', ['sass'], function () {
	gulp.watch('./assets/styles/**/*.scss', ['sass']);
});

gulp.task('watchjs', ['production'], function () {
	gulp.watch(['./assets/app/**/*.*', './assets/styles/**/*.*'], ['production']);
});
