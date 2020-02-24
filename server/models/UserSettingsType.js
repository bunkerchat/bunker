const { gql } = require("apollo-server-express");

module.exports = gql`
	type UserSettings {
		_id: ID
		showImages: Boolean
		showNotifications: Boolean
		showEmoticons: Boolean
		showDebugging: Boolean
		bunkerServesImages: Boolean
		minimalView: Boolean
		sortEmoticonsByPopularity: Boolean
		playSoundOnMention: Boolean
		desktopMentionNotifications: Boolean
		multilineShiftEnter: Boolean
		theme: String
		user: ID
	}
`;
