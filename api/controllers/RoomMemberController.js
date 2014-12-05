/**
 * RoomMemberController
 *
 * @description :: Server-side logic for managing Roommembers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');

module.exports.find = function (req, res) {

	// Lookup for records that match the specified criteria
	var query = RoomMember.find()
		.where(actionUtil.parseCriteria(req))
		.limit(actionUtil.parseLimit(req))
		.skip(actionUtil.parseSkip(req))
		.sort(actionUtil.parseSort(req));

	query = actionUtil.populateEach(query, req);
	query.exec(function found(err, matchingRecords) {
		if (err) return res.serverError(err);

		// Only `.watch()` for new instances of the model if
		// `autoWatch` is enabled.
		if (req._sails.hooks.pubsub && req.isSocket) {
			RoomMember.subscribe(req, matchingRecords);
		}

		res.ok(matchingRecords);
	});
};
