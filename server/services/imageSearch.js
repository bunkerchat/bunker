var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'), {multiArgs:true});

var config = require('../config/config');

var imageSearch = module.exports;

imageSearch.image = function (query) {
	return request.getAsync({
		json: true,
		url: 'https://www.googleapis.com/customsearch/v1',
		qs: {
			q: query,
			searchType: 'image',
			safe: 'high',
			fields: 'items(link)',
			cx: config.google.cse_id,
			key: config.google.cse_key
		}
	})
		.spread((res, body) => {
			if (res.statusCode === 403) {
				//msg.send("Daily image quota exceeded, using Bing search.");
				//return bingImageSearch(msg, query, animated, faces, cb);
				console.log('sad face');
			}

			//log.info('body', body);
			return {
				provider: 'google',
				images: _(body.items).pluck('link').map(ensureResult).value()
			}
		})
};


var bingImageSearch, deprecatedImage, ensureImageExtension, ensureResult, imageMe;

imageMe = function(msg, query, animated, faces, cb) {
	var googleApiKey, googleCseId, q, url;
	if (typeof animated === 'function') {
		cb = animated;
	}
	if (typeof faces === 'function') {
		cb = faces;
	}
	googleCseId = process.env.HUBOT_GOOGLE_CSE_ID;
	if (googleCseId) {
		googleApiKey = process.env.HUBOT_GOOGLE_CSE_KEY;
		if (!googleApiKey) {
			msg.robot.logger.error("Missing environment variable HUBOT_GOOGLE_CSE_KEY");
			msg.send("Missing server environment variable HUBOT_GOOGLE_CSE_KEY.");
			return;
		}
		q = {
			q: query,
			searchType: 'image',
			safe: process.env.HUBOT_GOOGLE_SAFE_SEARCH || 'high',
			fields: 'items(link)',
			cx: googleCseId,
			key: googleApiKey
		};
		if (animated === true) {
			q.fileType = 'gif';
			q.hq = 'animated';
			q.tbs = 'itp:animated';
		}
		if (faces === true) {
			q.imgType = 'face';
		}
		url = 'https://www.googleapis.com/customsearch/v1';
		return msg.http(url).query(q).get()(function(err, res, body) {
			var error, i, image, len, ref, ref1, response, results;
			if (err) {
				if (res.statusCode === 403) {
					msg.send("Daily image quota exceeded, using Bing search.");
					bingImageSearch(msg, query, animated, faces, cb);
				} else {
					msg.send("Encountered an error :( " + err);
				}
				return;
			}
			if (res.statusCode !== 200) {
				msg.send("Bad HTTP response :( " + res.statusCode);
				return;
			}
			response = JSON.parse(body);
			if (response != null ? response.items : void 0) {
				image = msg.random(response.items);
				return cb(ensureResult(image.link, animated));
			} else {
				msg.send("Oops. I had trouble searching '" + query + "'. Try later.");
				if ((ref = response.error) != null ? ref.errors : void 0) {
					ref1 = response.error.errors;
					results = [];
					for (i = 0, len = ref1.length; i < len; i++) {
						error = ref1[i];
						results.push((function(error) {
							msg.robot.logger.error(error.message);
							if (error.extendedHelp) {
								return msg.robot.logger.error("(see " + error.extendedHelp + ")");
							}
						})(error));
					}
					return results;
				}
			}
		});
	} else {
		return bingImageSearch(msg, query, animated, faces, cb);
	}
};

deprecatedImage = function(msg, query, animated, faces, cb) {
	var q;
	q = {
		v: '1.0',
		rsz: '8',
		q: query,
		safe: process.env.HUBOT_GOOGLE_SAFE_SEARCH || 'active'
	};
	if (animated === true) {
		q.as_filetype = 'gif';
		q.q += ' animated';
	}
	if (faces === true) {
		q.as_filetype = 'jpg';
		q.imgtype = 'face';
	}
	return msg.http('https://ajax.googleapis.com/ajax/services/search/images').query(q).get()(function(err, res, body) {
		var image, images, ref;
		if (err) {
			msg.send("Encountered an error :( " + err);
			return;
		}
		if (res.statusCode !== 200) {
			msg.send("Bad HTTP response :( " + res.statusCode);
			return;
		}
		images = JSON.parse(body);
		images = (ref = images.responseData) != null ? ref.results : void 0;
		if ((images != null ? images.length : void 0) > 0) {
			image = msg.random(images);
			return cb(ensureResult(image.unescapedUrl, animated));
		} else {
			return msg.send("Sorry, I found no results for '" + query + "'.");
		}
	});
};

bingImageSearch = function(msg, query, animated, faces, cb) {
	var bingApiKey, encoded_key, q, url;
	bingApiKey = process.env.HUBOT_BING_API_KEY;
	if (!bingApiKey) {
		msg.robot.logger.error("Missing environment variable HUBOT_BING_API_KEY");
		msg.send("Missing server environment variable HUBOT_BING_API_KEY");
		return;
	}
	q = {
		$format: 'json',
		Query: "'" + query + "'",
		Adult: "'Strict'"
	};
	encoded_key = new Buffer(bingApiKey + ":" + bingApiKey).toString("base64");
	url = "https://api.datamarket.azure.com/Bing/Search/Image";
	return msg.http(url).query(q).header("Authorization", "Basic " + encoded_key).get()(function(err, res, body) {
		var image, response;
		if (err) {
			if (res.statusCode === 403) {
				msg.send("Monthly Bing image quota exceeded. Please wait until tomorrow to search for more images.");
			} else {
				msg.send("Encountered an error :( " + err);
			}
			return;
		}
		response = JSON.parse(body);
		if ((response != null ? response.d : void 0) && response.d.results) {
			image = msg.random(response.d.results);
			return cb(ensureResult(image.MediaUrl, animated));
		} else {
			return msg.send("Oops. I had trouble searching '" + query + "'. Try later.");
		}
	});
};

ensureResult = function(url, animated) {
	if (animated === true) {
		return ensureImageExtension(url.replace(/(giphy\.com\/.*)\/.+_s.gif$/, '$1/giphy.gif'));
	} else {
		return ensureImageExtension(url);
	}
};

ensureImageExtension = function(url) {
	if (/(png|jpe?g|gif)$/i.test(url)) {
		return url;
	} else {
		return url + "#.png";
	}
};
