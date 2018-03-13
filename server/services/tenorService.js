var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'), {multiArgs:true});

const tenorService = module.exports;

tenorService.gifSearch = (query, userId) =>{
	return request.getAsync({
		json: true,
		url: 'https://api.tenor.com/v1/search',
		qs: {
			key: 'TLXOX607QZTE',
			limit: '10',
			anon_id: userId,
			q: query
		}
	})
		.spread((response, body) => {
			return _.map(body.results, result => {
				return {
					nanomp4: result.media.url,
					
				}
			})
		})
};
