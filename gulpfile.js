var gulp = require('gulp');
var ts = require('gulp-typescript');

gulp.task('default', function () {

    gulp.src(['./web/*.ts', '!./**/node_modules/**/*.*'])
        .pipe(ts({
            "noImplicitAny": true,
            "removeComments": true,
            "preserveConstEnums": true,
            "sourceMap": true,
            "target": "es5"
        }))
        .pipe(gulp.dest('.'));

    return gulp.src(['**/*.ts', '!./**/node_modules/**/*.*', '!./web/**/*.*'])
        .pipe(ts({
            "module": "commonjs",
            "noImplicitAny": true,
            "removeComments": true,
            "preserveConstEnums": true,
            "sourceMap": true,
            "target": "es6",
            "types": [
                "node"
            ]
        }))
        .pipe(gulp.dest('.'));

});