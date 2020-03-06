import { combineReducers } from "@reduxjs/toolkit";
import localUser from "./features/users/localUserReducer";
import localRoomMembers from "./features/users/localRoomMembersSlice";
import userSettings from "./features/settings/userSettingsReducer";
import users from "./features/users/usersSlice";
import rooms from "./features/rooms/roomsSlice";
import message from "./features/message/messageSlice";
import chatInput from "./features/chatInput/chatInputSlice";
import emoticonPicker from "./features/emoticon/emoticonPickerReducer";
import nickPicker from "./features/nickPicker/nickPickerSlice";
import messageControls from "./features/messageControls/messageControlsSlice";
import imagePick from "./features/imagePick/imagePickReducer";
import socket from "./features/socket/socketSlice";
import version from "./features/version/versionSlice";
import room from "./features/room/roomSlice";
// import log from "./features/chat/logReducer";

const rootReducer = combineReducers({
	localUser,
	localRoomMembers,
	userSettings,
	users,
	rooms,
	message,
	chatInput,
	emoticonPicker,
	nickPicker,
	messageControls,
	imagePick,
	socket,
	version,
	room
	// log,
});

export default rootReducer;
