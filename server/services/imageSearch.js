var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'), {multiArgs: true});

var config = require('../config/config');
var ImageCache = require('../models/ImageCache')

var imageSearch = module.exports;

imageSearch.image = function (query) {
	return googleImageSearch(query)
		.catch(() => ({provider: 'none', images: []}));
};

imageSearch.gif = function (query) {
	return googleImageSearch(query, true)
		.catch(() => ({provider: 'none', images: []}));
};

function googleImageSearch(query, animated) {
	var key = `imageSearch/google-${animated ? 'gif' : 'image'}|${query}`;
	return ImageCache.findOne({key: key})
		.then(dbCache => {
			if (dbCache) {
				log.info(`cache hit: ${key}`)
				return dbCache.results
			}
			return lookup()
		})

	function lookup() {
		if (!query) return Promise.reject('no query');

		var qs = {
			q: query,
			searchType: 'image',
			safe: 'high',
			fields: 'items(link)',
			cx: config.google.cse_id,
			key: config.google.cse_key
		};

		if (animated) {
			//qs.q += ' ".gif"';
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
					images: _(body.items).map('link').map(ensureResult).value()
				}
			})
			.then(results => {
				if (results) log.info(`no cache: ${key}`)
				return ImageCache.create({key, results})
			})
			.then(dbCache => {
				return dbCache.results
			})
	}
}

function ensureResult(url) {
	url = url.replace(/(giphy\.com\/.*)\/.+_s.gif$/, '$1/giphy.gif')
	return ensureImageExtension(url);
}

function ensureImageExtension(url) {
	// check if it doesn't end in file extension
	const match = /(png|jpe?g|gif).+$/i.exec(url)
	if (match && match[1]) {
		return url + `#.${match[1]}`
	} else {
		return url;
	}
}
