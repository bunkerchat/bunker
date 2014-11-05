/* global module */

/**
 * UserSettings.js
 *
 * @description :: Represents the settings for the associated user.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

'use strict';

module.exports = {
	attributes: {
		showImages: {
			type: 'boolean',
			defaultsTo: true
		},
		minimalView: {
			type: 'boolean',
			defaultsTo: false
		},
		user: {
			model: 'User'
		}
	}
};

