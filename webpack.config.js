const path = require("path");
const CircularDependencyPlugin = require("circular-dependency-plugin");

module.exports = (env, argv) => {
	const isProd = argv.mode === "production";

	console.log("isProd", isProd);

	const filename = isProd ? `[name].[contenthash].js` : `[name].bundle.js`;

	return {
		devtool: "source-map",
		entry: "./src/index.jsx",
		output: {
			filename,
			path: path.resolve(__dirname, "dist")
		},
		optimization: {
			runtimeChunk: "single",
			splitChunks: {
				chunks: "all",
				minSize: 30000,
				maxSize: 0,
				minChunks: 1,
				maxAsyncRequests: 5,
				maxInitialRequests: 3,
				automaticNameDelimiter: "~",
				name: true,
				cacheGroups: {
					vendors: {
						test: /[\\/]node_modules[\\/]/,
						name: "vendor-",
						chunks: "all",
						priority: -10
					},
					default: {
						minChunks: 2,
						priority: -20,
						reuseExistingChunk: true
					}
				}
			}
		},
		module: {
			rules: [
				{
					test: /\.(js|jsx)$/,
					exclude: /node_modules/,
					use: {
						loader: "babel-loader"
					}
				}
			]
		},
		plugins: [
			new CircularDependencyPlugin({
				// exclude detection of files based on a RegExp
				exclude: /node_modules/,
				// include specific files based on a RegExp
				include: /src/,
				// add errors to webpack instead of warnings
				failOnError: false,
				// allow import cycles that include an asyncronous import,
				// e.g. via import(/* webpackMode: "weak" */ './file.js')
				allowAsyncCycles: false,
				// set the current working directory for displaying module paths
				cwd: process.cwd()
			})
		]
		// enable for prod react profiling
		// resolve: {
		// 	alias: {
		// 		'react-dom$': 'react-dom/profiling',
		// 		'scheduler/tracing': 'scheduler/tracing-profiling',
		// 	}
		// }
	};
};
