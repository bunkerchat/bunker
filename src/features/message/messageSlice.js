import { createSlice } from "@reduxjs/toolkit";
import { maxMessages } from "../../constants/chat";
import { initialDataReceived } from "../init/initActions";

const parseMessage = message => {
	// Existing bunker server code sends new & loaded messages with a full author object
	// For consistency just make all message authors the same (_id only)
	const author = _.isObject(message.author) && message.author._id ? message.author._id : message.author;
	return { ...message, author };
};

const messageSlice = createSlice({
	name: "message",
	initialState: { byRoom: {}, byKey: {} },
	extraReducers: {
		[initialDataReceived]: (state, { payload }) => {
			state.byRoom = _.reduce(
				payload.rooms,
				(byRoom, room) => {
					byRoom[room._id] = _([...room.$messages])
						.reverse()
						.map(parseMessage)
						.value();
					return byRoom;
				},
				state.byRoom
			);

			state.byKey = payload.rooms.reduce((byKey, room) => {
				room.$messages.forEach(message => {
					if (!byKey) return; // no idea why this is happening
					byKey[message._id] = parseMessage(message);
				});
				return byKey;
			}, state.byKey);
		}
	},
	reducers: {
		messageReceived: (state, { payload }) => {
			const message = parseMessage(payload.message);
			state.lastMessage = message;
			if (state.byRoom[message.room]) {
				state.byRoom[message.room] = _.uniqBy([...state.byRoom[message.room], message], "_id");
			}
			state.byKey[message._id] = message;
		},

		messageHistoryReceived: (state, { payload }) => {
			const messages = _(payload.messages)
				.reverse()
				.map(parseMessage)
				.value();

			if (state.byRoom[payload.roomId]) {
				state.byRoom[payload.roomId] = _.uniqBy([...messages, ...state.byRoom[payload.roomId]], "_id");
			}

			state.byKey = messages.reduce((byKey, message) => {
				byKey[message._id] = message;
				return byKey;
			}, state.byKey || {});
		},

		clearRoomMessages: (state, { payload }) => {
			state.byRoom = _.takeRight(state.byRoom[payload.roomId], maxMessages);
		},

		messageUpdated: (state, { payload }) => {
			const message = parseMessage(payload.message);
			_.assignIn(state.byRoom[message.room]?.[message._id], message);
			_.assignIn(state.byKey[message._id], message);
		},

		toggleMessageImagesVisible: (state, { payload }) => {
			const { messageId } = payload;
			const message = state.byKey[messageId];
			message.imagesVisible = !message.imagesVisible;
		}
	}
});

export const {
	messageReceived,
	toggleMessageImagesVisible,
	messageUpdated,
	clearRoomMessages,
	messageHistoryReceived
} = messageSlice.actions;

export default messageSlice.reducer;
