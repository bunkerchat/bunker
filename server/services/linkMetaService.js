const linkMetaService = module.exports;

const Promise = require("bluebird");
const request = Promise.promisifyAll(require("request"), { multiArgs: true });
const cheerio = require("cheerio");

const metaMap = {
	"og:image": "image",
	"og:title": "title"
};

/**
 * Checks if the text contains a url, if so fetch the page and get OpenGraph meta data
 * about the link
 * @param text
 * @returns {Promise.<T>}
 */
linkMetaService.lookup = text => {
	// urls without images
	const urlMatch = /(https?:\/\/(?![^" ]*(?:jpg|png|gif|gifv|mp4|webm))[^" ]+)/gi.exec(text);
	if (!urlMatch || !urlMatch[1]) return Promise.resolve();

	const url = urlMatch[1];
	const linkMeta = { url };

	return request
		.getAsync(url, { timeout: 1500 })
		.spread((res, body) => {
			// load body into fake jquery finder
			const $ = cheerio.load(body);

			// find all meta tags with property
			const openGraphMeta = $("head meta[property]");
			_.each(openGraphMeta, meta => {
				const { property, content } = meta.attribs;

				// only get tags which match the metaMap above
				if (!_.includes(_.keys(metaMap), property)) return;
				linkMeta[metaMap[property]] = content;
			});

			return linkMeta;
		})
		.catch(e => {
			log.error(e);
			return Promise.resolve();
		});
};
