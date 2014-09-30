/**
 * Room.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
		name: {
			type: 'string',
			required: true
		},
		topic: 'string',
		isPrivate: {
			type: 'boolean',
			defaultsTo: true
		},
		owners: {
			collection: 'User'
		},
		members: {
			collection: 'User'
		}
	}
};

