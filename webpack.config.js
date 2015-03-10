module.exports = {
	entry: "./assets/app_react/entry.js",
	output: {
		path: __dirname + '/assets/bundled',
		publicPath: '/assets/bundled/',
		filename: "bundle.js"
	},
	module: {
		loaders: [
			{test: /\.css$/, loader: "style!css"},
			{test: /\.jsx$/, loader: "jsx-loader?harmony"},
			{test: /\.jpe?g$|\.gif$|\.png$|\.wav$|\.mp3$/, loader: "file-loader"},
			{test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff"},
			{test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader"}
		]
	}
};