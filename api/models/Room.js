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
			defaultsTo: false // TODO make this true when privacy controls are in place
		},
		members: {
			collection: 'User',
			via: 'rooms',
			dominant: true
		},
		messages: {
			collection: 'Message',
			via: 'room'
		}
	}
};

