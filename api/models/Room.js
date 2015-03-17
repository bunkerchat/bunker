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
		topic: {
			type: 'string',
			maxLength: 200
		},
		isPrivate: {
			type: 'boolean',
			defaultsTo: false // TODO make this true when privacy controls are in place
		}
	}
};

