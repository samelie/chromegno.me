var PORT = 4000;

/* jshint strict: false */
var gulp = require('gulp'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    chalk = require('chalk'),
    jsonminify = require('gulp-jsonminify'),
    plugins = require('gulp-load-plugins')();

/*var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    jshint = require('gulp-jshint'),
    csslint = require('gulp-csslint');*/
// paths and file names
var src = './src',
    dist = './',
    maxModules = dist + 'max-modules/',
    nodeModules = './node_modules',
    distAssets = dist + 'assets',
    jsSrc = src + '/js/',
    glslSrc = src + '/glsl/',
    jsonSrc = src + '/json/',
    jsIndex = 'main.js',
    iconSrc = src + '/glyphs/svg/',
    iconDist = distAssets + '/icons/',
    jsDist = distAssets + '/js/',
    jsonDist = distAssets + '/json/',
    jsBundle = 'bundle.js',
    cssSrc = src + '/styl/',
    cssIndex = 'main.css',
    cssDist = distAssets + '/css/',
    cssBundle = 'styles.css',
    tplSrc = src + '/ejs/**/*.ejs',
    vendors = distAssets + '/vendor/';

//CSS
gulp.task('css', function() {
    return gulp.src(cssSrc + '*.styl')
        .pipe(plugins.plumber())
        .pipe(plugins.stylus({
            'include css': true
        }))
        .pipe(plugins.rework(
            require('rework-suit'),
            require('rework-breakpoints'),
            require('rework-clearfix')
        ))
        .pipe(plugins.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest(cssDist))
        .pipe(plugins.rename({
            suffix: '.min'
        }))
        .pipe(plugins.minifyCss())
        .pipe(gulp.dest(cssDist));
});


//TEMPLATE JS
gulp.task('templates', function() {
    gulp.src(tplSrc)
        .pipe(plugins.jstConcat('templates.js', {
            renameKeys: ['^.*ejs/(.*).ejs', '$1'] // Removes file path from key
        }))
        .pipe(gulp.dest(jsDist));
});


//VENDOR JS
function buildVendorJS(debug) {
    stream = gulp.src([
        vendors + 'jquery/dist/jquery.js',
        vendors + 'lodash/lodash.js',
        vendors + 'backbone/backbone.js',
        vendors + 'marionette/backbone.marionette.js'
    ])
        .pipe(plugins.concat('libraries.js'))
        .pipe(gulp.dest(jsDist))
        .pipe(plugins.if(!debug, plugins.rename({
            suffix: '.min'
        })))
        .pipe(plugins.if(!debug, plugins.streamify(plugins.stripDebug())))
        .pipe(plugins.if(!debug, plugins.uglify()))
        .pipe(plugins.if(!debug, gulp.dest(jsDist)));
};

gulp.task('vendor-scripts', function() {
    buildVendorJS(true);
});

gulp.task('vendor-scripts-release', function() {
    buildVendorJS(false);
});


//PROJECT JS
function buildProjectJS(debug) {
    var bundler = browserify(jsSrc + jsIndex);
    //bundler.plugin(remapify, [{
    //	src: jsSrc + 'common/**/*.js',
    //	expose: 'common',
    //	cwd: __dirname
    //}])
    var bundle = function() {
        var bundleStream = bundler.bundle({
            debug: debug,
            alias: [
                nodeModules + '/express/lib/express.js:./lib-cov/express'
            ]
            /*,
				alias:[
					'common/constants.js:constants'
				]*/
            /*insertGlobals: true,
				shim: {
					templates: {
						path: distAssets + '/js/templates.js',
						exports: 'templates',
						depends: {
							underscore: '_'
						}
					}
				}*/
        });
        return bundleStream
            .on('error', logError)
            .pipe(source(jsSrc + jsIndex))
            .pipe(plugins.if(!debug, plugins.streamify(plugins.stripDebug())))
            .pipe(plugins.if(!debug, plugins.streamify(plugins.uglify())))
            .pipe(plugins.rename(jsBundle))
            .pipe(plugins.if(!debug, plugins.rename({
                suffix: '.min'
            })))
            .pipe(gulp.dest(jsDist));
    };
    return bundle();
};

gulp.task('project-scripts', function() {
    buildProjectJS(true);
});

gulp.task('project-scripts-release', function() {
    buildProjectJS(false);
});


//LOG
function logError(msg) {
    console.log(chalk.bold.red('[ERROR]'), msg);
}


//JS HINT - ignore libraries and bundled
gulp.task('jshint', function() {
    return gulp.src([
            './gulpfile.js',
            jsSrc + '/**/*.js',
            '!' + vendors + '**/*.js',
            '!' + jsSrc + '/lib/**/*.js',
            '!' + jsDist + jsBundle
        ])
        .pipe(jshint({
            'node': true,
            'browser': true,
            'es5': false,
            'esnext': true,
            'bitwise': false,
            'camelcase': false,
            'curly': true,
            'eqeqeq': true,
            'immed': true,
            'latedef': true,
            'newcap': true,
            'noarg': true,
            'quotmark': 'single',
            'regexp': true,
            'undef': true,
            'unused': true,
            'strict': true,
            'trailing': true,

            'predef': [
                'Modernizr',
                'ga'
            ]
        }))
        .pipe(jshint.reporter('jshint-stylish'));
});

// jsons task
gulp.task('jsons', function() {
    return gulp.src([jsonSrc + '**/*'])
        .pipe(plugins.jsonminify())
        .pipe(gulp.dest(jsonDist));
});


//CSS LINT - ignore bundled
gulp.task('csslint', function() {
    gulp.src([
        cssSrc + '**/*.css',
        '!' + cssSrc + cssIndex,
        '!' + cssDist + cssBundle
    ])
        .pipe(csslint({
            'adjoining-classes': false,
            'box-model': false,
            'box-sizing': false,
            'compatible-vendor-prefixes': false,
            'bulletproof-font-face': false,
            'empty-rules': false,
            'font-faces': false,
            'font-sizes': false,
            'important': false,
            'known-properties': false,
            'outline-none': false,
            'regex-selectors': false,
            'star-property-hack': false,
            'unique-headings': false,
            'universal-selector': false,
            'unqualified-attributes': false
        }))
        .pipe(csslint.reporter());
});


//WATCH
gulp.task('watch', function() {
    gulp.watch(cssSrc + '**/*.{styl,css}', ['css']);
    gulp.watch(jsSrc + '**/*.js', ['project-scripts']);
    gulp.watch(glslSrc + '**/*.*', ['project-scripts']);
    gulp.watch(jsonSrc + '**/*.json', ['jsons']);
    gulp.watch(src + '/ejs/*.ejs', ['templates']);
});

//JS
gulp.task('vendor', ['vendor-scripts-release']);
gulp.task('vendor-dev', ['vendor-scripts']);

gulp.task('build', ['project-scripts-release', 'templates', 'css']);
gulp.task('build-dev', ['project-scripts', 'templates', 'css']);

//DEFAULT
gulp.task('default', ['watch', 'build-dev']);