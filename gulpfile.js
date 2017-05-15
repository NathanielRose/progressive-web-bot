var gulp = require('gulp');
var ts = require('gulp-typescript');

gulp.task('default', function () {
    return gulp.src(['**/*.ts', '!./**/node_modules/**/*.*'])
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