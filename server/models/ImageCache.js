var mongoose = require('mongoose');

var fourMonths =
	60 /*seconds*/
	* 60 /*minutes*/
	* 24 /*hours*/
	* 120 /*days*/
;


var imageCacheSchema = new mongoose.Schema({
	createdAt:{
		type: Date,
		default: Date.now,
		expires: fourMonths
	},
	key: {
		type:String,
		index:true
	},
	results: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('ImageCache', imageCacheSchema, 'imageCache');
