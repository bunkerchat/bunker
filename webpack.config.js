const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

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
		plugins: [new CleanWebpackPlugin()]
		// enable for prod react profiling
		// resolve: {
		// 	alias: {
		// 		'react-dom$': 'react-dom/profiling',
		// 		'scheduler/tracing': 'scheduler/tracing-profiling',
		// 	}
		// }
	};
};
