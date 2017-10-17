import _ from 'lodash'
import Immutable from 'seamless-immutable'
import {makeReducer} from '../config/reduxTools'

const INITIAL_STATE = Immutable({
	rooms: null
})
const reducer = {}

const isSameDay = (message, previousMessage) => {
	const currMessageDate = new Date(message.createdAt);

	if (!previousMessage) {
		return false;
	}

	const prevMessageDate = new Date(previousMessage.createdAt);
	return currMessageDate.toDateString() === prevMessageDate.toDateString();
};


const reduceMessage = (message, previousMessage) => {

	// full author object is populated sometimes, we just want ID.
	message.author = _.isString(message.author) ? message.author : message.author && message.author._id;
	message.isSameDay = isSameDay(message, previousMessage);

	return message;
};

reducer['socketio-init'] = (state, {rooms}) => {
	rooms.forEach((room) => {
		// remap messages
		room.$messages = room.$messages.map((message, index) => reduceMessage(message, room.$messages[index + 1]));
	});

	return state.merge({rooms: _.keyBy(rooms, '_id')})
}

reducer['socketio-room-messaged'] = (state, {data}) => {
	const message = data
	const roomId = message.room
	const room = state.rooms[roomId]

	if (message.edited) {
		const index = _.findIndex(room.$messages, { _id: message._id });

		if (index === -1) return state;

		const $messages = [...room.$messages.slice(0, index), reduceMessage(message, room.$messages[index + 1]), ...room.$messages.slice(index + 1)];

		return state.setIn(['rooms', roomId, '$messages'], $messages);
	} else {
		const $messages = [reduceMessage(message, room.$messages[0]), ...room.$messages]
		return state.setIn(['rooms',roomId,'$messages'], $messages)
	}
}

reducer['room/messagesFetched'] = (state, {roomId, messages}) => {

	const room = state.rooms[roomId];

	messages = messages.map((item, index) => {
		return reduceMessage(item, messages[index + 1]);
	});

	const $messages = [...room.$messages, ...messages];

	return state.setIn(['rooms', roomId, '$messages'], $messages);
};

export const messagesFetched = (roomId, messages) => ({type: 'room/messagesFetched', roomId, messages});

export default makeReducer(INITIAL_STATE, reducer)

