import { createSelector } from "reselect";

const getUsers = state => state.users;
const getRooms = state => state.rooms;
const getRoomMembers = (state, props) => state.rooms[props.roomId].$members;
const getLocalRoomMembersByRoom = state => state.localRoomMembers.byRoom;
export const getAuthorUser = (state, props) => state.users[props.authorId];
export const getMessageAuthor = (state, props) => state.users[props.message.author];

export const getActiveRoom = createSelector([getRooms], rooms => _.find(rooms, { current: true }));

export const getTotalUnreadMessageCount = createSelector([getLocalRoomMembersByRoom], localRoomMembersByRoom =>
	_.reduce(localRoomMembersByRoom, (count, roomMember) => count + (roomMember.unreadMessageCount || 0), 0)
);

export const hasAnyUnreadMention = createSelector([getLocalRoomMembersByRoom], localRoomMembersByRoom =>
	_.some(localRoomMembersByRoom, roomMember => roomMember.unreadMessageCount > 0 && roomMember.unreadMention)
);

export const makeGetRoomMemberUsers = () => {
	return createSelector([getUsers, getRoomMembers], (users, roomMembers) =>
		_(roomMembers)
			.map(roomMember => {
				const user = users[roomMember.user];
				return user ? { roomMember, user } : null;
			})
			.remove()
			.value()
	);
};

export const makeGetRoomTopic = createSelector([getActiveRoom], room => {
	if (!room) return;
	return {
		tokens: room.topicTokens,
		text: room.topic
	};
});
