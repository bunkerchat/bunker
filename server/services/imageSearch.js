const imageSearch = module.exports;

const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'), {multiArgs: true});
const ent = require('ent');

const config = require('../config/config');
const ImageCache = require('../models/ImageCache')
const socketio = require('../config/socketio');

imageSearch.image = (roomMember, text) => {
	const match = /^\/image(?:pick|search)*\s+(.*)$/i.exec(text);
	const searchQuery = ent.decode(match[1]);

	return image(searchQuery)
		.then(result => {
			socketio.io.to('userself_' + roomMember.user._id)
				.emit('user', {
					_id: roomMember.user._id,
					verb: 'messaged',
					data: {
						type: 'pick',
						message: `[${result.provider} image "${searchQuery}"] `,
						data: result.images
					}
				});
		});
}

imageSearch.gif = (roomMember, text) => {
	const match = /^\/gif(?:pick|search)*\s+(.*)$/i.exec(text);
	const searchQuery = ent.decode(match[1]);

	return gif(searchQuery)
		.then(result => {
			socketio.io.to('userself_' + roomMember.user._id)
				.emit('user', {
					_id: roomMember.user._id,
					verb: 'messaged',
					data: {
						type: 'pick',
						message: `[${result.provider} gif "${searchQuery}"] `,
						data: result.images
					}
				});
		});
}

function image (query) {
	return googleImageSearch(query)
		.catch(() => ({provider: 'none', images: []}));
};

function gif (query) {
	return googleImageSearch(query, true)
		.catch(() => ({provider: 'none', images: []}));
};

function googleImageSearch(query, animated) {
	const key = `imageSearch/google-${animated ? 'gif' : 'image'}|${query}`;
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

		const qs = {
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
					log.error(`403 - ${JSON.stringify(res.body, null, 2)}`);
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
