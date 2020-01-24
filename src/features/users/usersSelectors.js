export const getUsers = state => state.users;
export const getAuthorUser = (state, props) => state.users[props.authorId];
export const getMessageAuthor = (state, props) => state.users[props.message.author];
export const getLocalUser = state => state.localUser;
export const getLocalRoomMembersByRoom = state => state.localRoomMembers.byRoom;
export const getLocalUserPresent = state => state.localUser.present;
export const getNick = state => state.localUser.nick;
