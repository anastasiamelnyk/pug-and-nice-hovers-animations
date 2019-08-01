const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require ('gulp-plumber');
const postCSS = require('gulp-postcss');
const autopref = require('autoprefixer');
const postcssNorm = require('postcss-normalize');
const maps = require('gulp-sourcemaps');
const minCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const sync = require('browser-sync');
const img = require('gulp-imagemin');
const pug = require('gulp-pug');
const minHtml = require('gulp-htmlmin');
const clean = require('del');


//style task
gulp.task('style', () => {
  return gulp.src('src/style/style.scss')
  .pipe(plumber())
  .pipe(maps.init())
  .pipe(sass())
  .pipe(postCSS([
    autopref(),
    postcssNorm()
  ]))
  .pipe(maps.write('./'))
  .pipe(gulp.dest('prod/style'))
  .pipe(minCSS())
  .pipe(rename('style.min.css'))
  .pipe(gulp.dest('prod/style'))
  .pipe(sync.reload({stream:true}));
});


//image tasks
gulp.task('minImg', () => {
  return gulp.src('src/images/*.{png,jpg,svg}')
  .pipe(img([
    img.optipng({optimizationLevel: 3}),
    img.jpegtran({progressive: true}),
    img.svgo({
        plugins: [
            {removeViewBox: false}
        ]
    })
    ]))
  .pipe(gulp.dest('prod/images'));
});


//pug task
gulp.task('pug', () => {
  return gulp.src('src/pug/**/index.pug')
  .pipe(pug({pretty: true}))
  .pipe(gulp.dest('src'));
});


//html tasks
gulp.task('htmlMin', () => {
  return gulp.src('src/index.html')
  .pipe(minHtml(
    { collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true
    }))
  .pipe(gulp.dest('prod'));
});

gulp.task('html', gulp.series('pug', 'htmlMin'));


//build tasks
gulp.task('cleanProd', () => {
  return clean('prod');
});

gulp.task('copy', () => {
  return gulp.src('src/fonts/**', { base: 'src' })
  .pipe(gulp.dest('prod'));
});

gulp.task('prod', gulp.series(
  'cleanProd', gulp.parallel(
    'copy',
    'style',
    'html',
    'minImg')));


//live watching
gulp.task('default', gulp.series('prod', () => {
  sync.init({
    server: 'prod'
  });
  gulp.watch('src/style/**/*.scss', gulp.series('style'));
  gulp.watch('src/pug/**/*.pug', gulp.series('html'));
  gulp.watch('src/js/**.js', gulp.series('js'));
}));
