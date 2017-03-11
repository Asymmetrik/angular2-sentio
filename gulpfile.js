'use strict';

let
	chalk = require('chalk'),
	glob = require('glob'),
	gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	merge = require('merge2'),
	path = require('path'),
	rollup = require('rollup'),
	runSequence = require('run-sequence'),
	webpack = require('webpack'),
	webpackDevServer = require('webpack-dev-server'),

	plugins = gulpLoadPlugins(),
	pkg = require('./package.json'),
	assets = require('./config/assets');


// Banner to append to generated files
let bannerString = '/*! ' + pkg.name + '-' + pkg.version + ' - ' + pkg.copyright + '*/';

/**
 * ENV Tasks
 */
let BUILD = false;
gulp.task('env:BUILD', () => {
	BUILD = true;
});


/**
 * Validation Tasks
 */

gulp.task('validate-ts', () => {

	return gulp.src(assets.src.allTs)
		// Lint the Typescript
		.pipe(plugins.tslint({
			formatter: 'prose'
		}))
		.pipe(plugins.tslint.report({
			summarizeFailureOutput: true,
			emitError: BUILD
		}));

});


/**
 * Build
 */

// Build JS from the TS source
gulp.task('build-ts', () => {
	return plugins.ngc('./tsconfig-aot.json');
});

// Bundle the generated JS (rollup and then uglify)
gulp.task('build-js', ['rollup-js'], () => {

	// Uglify
	return gulp.src(path.join(assets.dist.bundleDir, (pkg.artifactName + '.js')))
		.pipe(plugins.uglify({ preserveComments: 'license' }))
		.pipe(plugins.rename(pkg.artifactName + '.min.js'))
		.pipe(gulp.dest(assets.dist.bundleDir));

});

// Rollup the generated JS
gulp.task('rollup-js', () => {

	return rollup.rollup({
			entry: path.join(assets.dist.dir, '/index.js'),
			external: [
				'@angular/core',
				'd3',
				'rxjs',
				'@asymmetrik/sentio'
			],
			onwarn: (warning) => {
				if ('THIS_IS_UNDEFINED' === warning.code) {
					return;
				}
				plugins.util.log(warning.message);
			}
		})
		.then((bundle) => {
			return bundle.write({
				dest: path.join(assets.dist.bundleDir, (pkg.artifactName + '.js')),
				format: 'umd',
				moduleName: 'angular2Sentio',
				sourceMap: true,
				banner: bannerString,
				globals: {
					'@angular/core': 'ng.core',
					'@asymmetrik/sentio': 'sentio',
					'd3': 'd3',
					'rxjs': 'Rx'
				}
			});
		});

});


/**
 * Develop
 */
gulp.task('webpack-dev-server', (done) => {
	// Start a webpack-dev-server
	let webpackConfig = require(path.resolve('./config/webpack.config.js'))();
	let compiler = webpack(webpackConfig);

	new webpackDevServer(compiler, {
		stats: {
			colors: true,
			chunks: false
		},
		watchOptions: {
			aggregateTimeout: 300,
			poll: 1000
		},
	}).listen(9000, 'localhost', (err) => {
		if(err) throw new plugins.util.PluginError('webpack', err);

		// Server listening
		plugins.util.log('[webpack]', 'http://localhost:9000/webpack-dev-server/index.html');
	});
});

gulp.task('watch-ts', () => {
	gulp.watch(assets.src.allTs, ['validate-ts']);
});

/**
 * --------------------------
 * Main Tasks
 * --------------------------
 */

gulp.task('dev', (done) => { runSequence('validate-ts', [ 'webpack-dev-server', 'watch-ts' ], done); } );

gulp.task('build', (done) => { runSequence('env:BUILD', 'validate-ts', 'build-ts', 'build-js', done); } );

// Default task builds
gulp.task('default', [ 'build' ]);
