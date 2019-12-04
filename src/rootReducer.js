import { combineReducers } from "@reduxjs/toolkit";
import localUser from "./features/users/localUserReducer";
import localRoomMembers from "./features/users/localRoomMembersReducer";
import userSettings from "./features/settings/userSettingsReducer";
import users from "./features/users/usersReducer";
import rooms from "./features/room/roomReducer";
import messages from "./features/message/messagesReducer";
import chatInput from "./features/input/chatInputReducer";
import emoticonPicker from "./features/emoticon/emoticonPickerReducer";
import messageControls from "./features/messageControls/messageControlsReducer";
import imagePick from "./features/imagePick/imagePickReducer";
import log from "./features/chat/logReducer";
import imageUpload from "./features/imageUpload/imageUploadReducer";

const rootReducer = combineReducers({
	localUser,
	localRoomMembers,
	userSettings,
	users,
	rooms,
	messages,
	chatInput,
	emoticonPicker,
	messageControls,
	imagePick,
	log,
	imageUpload
});

export default rootReducer;
