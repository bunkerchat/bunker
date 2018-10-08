import { createSelector } from "reselect";

const getUsers = state => state.users;
const getRoomMembers = (state, props) => state.rooms[props.roomId].$members;
const getLocalRoomMembersByRoom = state => state.localRoomMembers.byRoom;

export const totalUnreadMessageCount = createSelector([getLocalRoomMembersByRoom], localRoomMembersByRoom =>
	_.reduce(localRoomMembersByRoom, (count, roomMember) => count + (roomMember.unreadMessageCount || 0), 0)
);

export const anyUnreadMention = createSelector([getLocalRoomMembersByRoom], localRoomMembersByRoom =>
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
