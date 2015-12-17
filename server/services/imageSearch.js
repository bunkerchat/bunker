var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'), {multiArgs: true});

var config = require('../config/config');
var cacheService = require('./cacheService');

var imageSearch = module.exports;

imageSearch.image = function (query) {
	return googleImageSearch(query)
		.catch(() => bingImageSearch(query, true))
		.catch(() => ({provider: 'none'}));
};

imageSearch.gif = function (query) {
	return googleImageSearch(query, true)
		.catch(() => bingImageSearch(query, true))
		.catch(() => ({provider: 'none'}));
};

function googleImageSearch(query, animated) {
	var key = `imageSearch/google-${animated ? 'gif' : 'image'}|${query}`;
	return cacheService.fourMonths.getAsync(key)
		.then(result => result || lookup())
		.then(JSON.parse);

	function lookup() {
		var qs = {
			q: query,
			searchType: 'image',
			//safe: 'high',
			fields: 'items(link)',
			cx: config.google.cse_id,
			key: config.google.cse_key
		};

		if (animated) {
			qs.q += ' ".gif"';
			qs.fileType = 'gif';
			//qs.hq = 'animated';
			qs.tbs = 'itp:animated';
		}

		return request.getAsync({
			json: true,
			url: 'https://www.googleapis.com/customsearch/v1',
			qs: qs
		})
			.spread((res, body) => {
				if (res.statusCode === 403) {
					console.log('sad face');
					return Promise.reject(new Error('over capacity'));
				}

				return {
					provider: 'google',
					images: _(body.items).pluck('link').map(ensureResult).value()
				}
			})
			.then(JSON.stringify)
			.then(results => cacheService.fourMonths.setAsync(key, results));
	}
}

var encodedBingKey = new Buffer(config.bingApiKey + ":" + config.bingApiKey).toString("base64");

function bingImageSearch(query, animated) {
	var key = `imageSearch/bing-${animated ? 'gif' : 'image'}|${query}`;
	return cacheService.fourMonths.getAsync(key)
		.then(result => result || lookup())
		.then(JSON.parse);

	function lookup() {
		var qs = {
			$format: 'json',
			Query: `'${query}'`,
			Adult: "'Strict'"
		};

		if (animated) {
			// arg why?! no good api unfortunately
			qs.Query = `'${query} ".gif"'`;
		}

		return request.getAsync({
			json: true,
			url: "https://api.datamarket.azure.com/Bing/Search/Image",
			headers: {
				"Authorization": `Basic ${encodedBingKey}`
			},
			qs: qs
		})
			.spread((res, body) => {
				if (res.statusCode === 403) {
					console.log('sad face');
					return Promise.reject(new Error('over capacity'));
				}

				if (res.statusCode == 400) {
					console.error('bing error', body)
					return Promise.reject(body);
				}

				// we don't need 50 results
				body.d.results.length = 12;

				return {
					provider: 'bing',
					images: _(body.d.results).pluck('MediaUrl').map(ensureResult).value()
				}
			})
			.then(JSON.stringify)
			.then(results => cacheService.fourMonths.setAsync(key, results));
	}
}

function ensureResult(url, animated) {
	if (animated === true) {
		return ensureImageExtension(url.replace(/(giphy\.com\/.*)\/.+_s.gif$/, '$1/giphy.gif'));
	} else {
		return ensureImageExtension(url);
	}
}

function ensureImageExtension(url) {
	if (/(png|jpe?g|gif)$/i.test(url)) {
		return url;
	} else {
		return url + "#.png";
	}
}
