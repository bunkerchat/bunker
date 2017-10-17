import _ from 'lodash'
import Immutable from 'seamless-immutable'
import {makeReducer} from '../config/reduxTools'

const INITIAL_STATE = Immutable({
	rooms: null,
	currentBunkerUser: null
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

// This method assumes that the previous message was reduced first
const reduceMessage = (user, message, previousMessage) => {

	// full author object is populated sometimes, we just want ID.
	message.author = _.isString(message.author) ? message.author : message.author && message.author._id;

	message.isCurrentUser = message.author && message.author.toLowerCase() === user._id.toLowerCase();

	message.isFirstInRun = true;

	if (previousMessage && previousMessage.author && previousMessage.author.toLowerCase() === message.author.toLowerCase()) {
		message.isFirstInRun = false;
	}

	message.isSameDay = isSameDay(message, previousMessage);

	return message;
};

const reduceMessages = (user, messages) => {
	const newMessagesArray = [];

	// walk the messages list in reverse, reducing as we go.
	for (let i = messages.length - 1; i >= 0; i--) {
		newMessagesArray[i] = reduceMessage(user, messages[i], newMessagesArray[i + 1]);
	}

	return newMessagesArray;
};

reducer['socketio-init'] = (state, {rooms, user}) => {
	rooms.forEach((room) => {
		room.$messages = reduceMessages(user, room.$messages);
	});

	return state.merge({rooms: _.keyBy(rooms, '_id'), currentBunkerUser: user});
};

reducer['socketio-room-messaged'] = (state, {data}) => {
	const message = data
	const roomId = message.room
	const room = state.rooms[roomId]

	if (message.edited) {
		const index = _.findIndex(room.$messages, { _id: message._id });

		if (index === -1) return state;

		const $messages =
			[
				...room.$messages.slice(0, index),
				reduceMessage(state.currentBunkerUser, message, room.$messages[index + 1]),
				...room.$messages.slice(index + 1)
			];

		return state.setIn(['rooms', roomId, '$messages'], $messages);
	} else {
		const $messages = [reduceMessage(state.currentBunkerUser, message, room.$messages[0]), ...room.$messages]
		return state.setIn(['rooms',roomId,'$messages'], $messages)
	}
}

reducer['room/messagesFetched'] = (state, {roomId, messages}) => {

	const room = state.rooms[roomId];

	messages = reduceMessages(state.currentBunkerUser, messages);

	// this is goofy but we have to replace the last message of the original list to make various variables correct,
	// then merge everything together.
	const $messages = [...room.$messages.slice(0, room.$messages.length - 1),
		_.extend({}, reduceMessage(state.currentBunkerUser, room.$messages[room.$messages.length - 1], messages[0])),
		...messages];

	return state.setIn(['rooms', roomId, '$messages'], $messages);
};

export const messagesFetched = (roomId, messages) => ({type: 'room/messagesFetched', roomId, messages});

export default makeReducer(INITIAL_STATE, reducer)

