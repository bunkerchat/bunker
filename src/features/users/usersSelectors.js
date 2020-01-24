export const getUsers = state => state.users;

export const getUserById = userId => state => state.users[userId];

export const getUserEmail = userId => state => getUserById(userId)(state)?.email;

export const getUserConnected = userId => state => getUserById(userId)(state)?.connected;

export const getUserPresent = userId => state => getUserById(userId)(state)?.present;

export const getUserNick = userId => state => getUserById(userId)(state)?.nick;

export const getLocalUser = state => state.localUser;

export const getLocalUserId = state => state.localUser._id;

export const getLocalRoomMembersByRoom = state => state.localRoomMembers.byRoom;

export const getLocalUserPresent = state => state.localUser.present;

export const getNick = state => state.localUser.nick;

export const getUnreadMention = roomId => state => getLocalRoomMembersByRoom(state)[roomId]?.unreadMention;

export const getUnreadMessageCount = roomId => state => getLocalRoomMembersByRoom(state)[roomId]?.unreadMessageCount;
