//var io = require('socket.io')(80);
//var cfg = require('./config.json');
//var tw = require('node-tweet-stream')(cfg);
//tw.track('socket.io');
//tw.track('javascript');
//tw.on('tweet', function(tweet){
//	io.emit('tweet', tweet);
//});

module.exports = function (server) {
	var io = require('socket.io')(server);

	io.on('connection', function (socket) {
		console.log('socket', socket);
		socket.emit('news', { hello: 'world' });
		socket.on('my other event', function (data) {
			console.log(data);
		});
	});

	return io;
};
