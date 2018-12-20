var GifController = module.exports;

var imageSearch = require("../services/imageSearch");

GifController.index = function(req, res) {
	var search = req.query.search || req.params.search;

	imageSearch.gif(search).then(results => {
		res.render("gif", { results, search });
	});
};
