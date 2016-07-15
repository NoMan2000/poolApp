(function () {
    "use strict";
    var gulp = require('gulp');
    var $ = require('gulp-load-plugins')({lazy: true});
    var jsFiles = ['public/js/app.js'];

    gulp.task('style', function () {
        return gulp.src(jsFiles)
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish', {
                verbose: true
            }))
            .pipe($.eslint({
                configFile: './.eslintrc.js'
            }))
            .pipe($.eslint.format());
    });

    gulp.task('inject', function () {
        var wiredep = require('wiredep');
        console.log(wiredep());
        return;
        var js = gulp.src(wiredep().js),
            css = gulp.src(wiredep().css),
            jsDest = gulp.dest('./public/js'),
            cssDest = gulp.dest('./public/css'),
            target = gulp.src('./public/index.html');

        return target.pipe(
            $.inject(
                js.pipe(
                    $.concat('bower.js')
                ).pipe(jsDest)
            )
        ).pipe(
            $.inject(
                css.pipe($.concat('bower.css')
                )
            ).pipe(cssDest)
        ).pipe(gulp.dest('./public'));
    });
}());
