import { createSelector } from "@reduxjs/toolkit";
import { getUsers } from "../users/usersSelectors.js";
import { getLastMessageContainsMention } from "../../selectors/selectors.js";

export const getLastMentionAuthorNick = createSelector(
	[getLastMessageContainsMention, getUsers],
	(lastMessageMention = {}, users = {}) => users[lastMessageMention.author]?.nick
);
