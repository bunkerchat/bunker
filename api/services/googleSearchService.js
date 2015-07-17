var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));

module.exports.imageSearch = function (query) {
	// supposedly this API was turned off a year ago but still seems to work :shrug:
	// there is a new API with a 100 / day limit but I couldn't get it working :fistshake:
	// notes for new api


	return request.getAsync({
		json: true,
		url: 'https://ajax.googleapis.com/ajax/services/search/images',
		qs: {
			v: '1.0',
			rsz: 8,
			safe: 'active',
			q: query
		}
	})
		.spread(function (response, body) {
			return body.responseData.results[0].unescapedUrl;
		});
};

module.exports.gifSearch = function (query) {
	return request.getAsync({
		json: true,
		url: 'https://ajax.googleapis.com/ajax/services/search/images',
		qs: {
			v: '1.0',
			rsz: 8,
			safe: 'active',
			imgType: 'animated',
			q: query
		}
	})
		.spread(function (response, body) {
			var images = _.filter(body.responseData.results, function (result) {
				if(result.unescapedUrl.indexOf('giphy') > -1) return false;
				if(result.unescapedUrl.indexOf('ytimg') > -1) return false;
				if(result.unescapedUrl.indexOf('gifsec') > -1) return false;
				if(result.unescapedUrl.indexOf('photobucket') > -1) return false;
				return true;
			});

			if(images.length) {
				return _.sample(images).unescapedUrl;
			}
		});
};