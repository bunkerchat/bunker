const { gql } = require("apollo-server-express");
const UserSettingsType = require("../models/UserSettingsType");
const UserSettings = require("./../models/UserSettings");

module.exports.typeDefs = gql`
	type Query {
		userSettings(userId: ID): [UserSettings]
	}

	${UserSettingsType}
`;

// Provide resolver functions for your schema fields
module.exports.resolvers = {
	Query: {
		userSettings: (root, { userId }) => UserSettings.findOne({ user: userId }).lean()
	},
	// UserSettings: {
	// 	userId: ({ userId }) => UserSettings.findOne({ user: userId }).lean()
	// }
};
