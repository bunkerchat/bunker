import { getMessageAuthorId } from "../message/messageSelectors";
import { getUserNick } from "../users/usersSelectors";

export const getNickForMessage = messageId => state => {
	const authorId = getMessageAuthorId(messageId)(state);
	return getUserNick(authorId)(state);
};
