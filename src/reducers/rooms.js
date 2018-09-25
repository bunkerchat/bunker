import {maxMessages} from "../constants/chat";

const parseMessage = (message) => {
	// Existing bunker server code sends new & loaded messages with a full author object
	// For consistency just make all message authors the same (_id only)
	message.author = message.author._id;
	return message;
};

const handlers = {
	'init/receive': (state, action) => {
		return _(action.data.rooms)
			.map(room => {
				room.$messages = _.reverse(room.$messages);
				return room;
			})
			.keyBy('_id')
			.value()
	},
	'message/loadingMany': (state, action) => {
		const updated = {...state};
		updated[action.roomId].loading = true;
		return updated;
	},
	'message/receive': (state, action) => {
		action.message = parseMessage(action.message);

		const updated = {...state};
		const room = updated[action.message.room];
		room.$messages = [...room.$messages, action.message];
		return updated;
	},
	'message/receiveMany': (state, action) => {
		action.messages = _.map(action.messages, parseMessage);

		const updated = {...state};
		const room = updated[action.roomId];
		room.loading = false;

		if (action.messages.length === 0) {
			// todo handle this nicer?
			console.log("no more messages");
		}
		else {
			room.$messages = _.uniqBy([..._.reverse(action.messages), ...room.$messages], '_id');
		}

		return updated;
	},
	'message/clear': (state, action) => {
		const updated = {...state};
		const room = updated[action.roomId];
		room.$messages = _.takeRight(room.$messages, maxMessages);
		return updated;
	}
};

export default function (state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}
