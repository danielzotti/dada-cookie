/// <binding BeforeBuild='build' ProjectOpened='default' />

var fs = require('fs'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    ts = require('gulp-typescript'),
    concat = require('gulp-concat');

var paths = {
    stylesheets: {
        src: "service/scss/dada.cookie.scss",
        dest: "service/content/css/"
    },
    typescripts: {
        src: "service/scripts/dada.cookie.ts",
        dest: "service/content/js/"
    },
    typescripts_local: {
        src: "service/scripts/dada.cookie_local.ts",
        dest: "service/content/js/"
    }
}

gulp.task('sass', [], function () {
    var name = 'dada.cookie',
        styleCssName = name + ".css",
        styleMinCssName = name + ".min.css",
        src = paths.stylesheets.src,
        dest = paths.stylesheets.dest;

    deleteFile(dest + styleCssName);
    deleteFile(dest + styleMinCssName);

    gulp.src(src)
    .pipe(sass())
    .pipe(concat(styleCssName))
    .pipe(gulp.dest(dest));

    gulp.src(src)
    .pipe(sass({outputStyle: "compressed"}))
    .pipe(concat(styleMinCssName))
    .pipe(gulp.dest(dest));
});


gulp.task('typescript', [], function () {
    var name = 'dada.cookie',
        jsName = name + ".js",
    src = paths.typescripts.src;
    dest = paths.typescripts.dest;

    deleteFile(dest + jsName);

    var tsResult = gulp.src(src)
    .pipe(ts({
        out: jsName
    }));
    return tsResult.js.pipe(gulp.dest(dest));

});

gulp.task('typescript_local', [], function () {
    var name = 'dada.cookie_local',
        jsName = name + ".js",
        src = paths.typescripts_local.src;
    dest = paths.typescripts_local.dest;

    deleteFile(dest + jsName);

    var tsResult = gulp.src(src)
        .pipe(ts({
            out: jsName
        }));
    return tsResult.js.pipe(gulp.dest(dest));

});

gulp.task('build', ['sass', 'typescript', 'typescript_local']);

gulp.task('default', function () {
    gulp.watch(paths.stylesheets.src, ['sass'])
    .on('change', function (evt) {
        console.log('[watcher] File Sass ' + evt.path.replace(/.*(?=sass)/, '') + ' was ' + evt.type + ', compiling...');
    });

    gulp.watch(paths.typescripts.src, ['typescript'])
    .on('change', function (evt) {
        console.log('[watcher] File Typescript ' + evt.path.replace(/.*(?=typescript)/, '') + ' was ' + evt.type + ', compiling...');
    });

    gulp.watch(paths.typescripts_local.src, ['typescript_local'])
    .on('change', function (evt) {
        console.log('[watcher] File Typescript ' + evt.path.replace(/.*(?=typescript)/, '') + ' was ' + evt.type + ', compiling...');
    });
});

function deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}