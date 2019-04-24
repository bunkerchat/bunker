import { combineReducers } from "redux";
import { createBrowserHistory } from "history";
import { applyMiddleware, compose, createStore } from "redux";
import { connectRouter, routerMiddleware } from "connected-react-router";
import thunk from "redux-thunk";
const history = createBrowserHistory();

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
	log
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
	connectRouter(history)(rootReducer), // new root reducer with router state
	composeEnhancers(
		applyMiddleware(
			routerMiddleware(history), // for dispatching history actions
			thunk
			// ... other middlewares ...
		)
	)
);

const dispatch = store.dispatch;

export { store, history, dispatch };
