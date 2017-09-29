import _ from 'lodash'
import Immutable from 'seamless-immutable'
import {makeReducer} from '../config/reduxTools'

const INITIAL_STATE = Immutable({
	rooms: null
})
const reducer = {}

reducer['socketio-init'] = (state, {rooms}) => {
	return state.merge({rooms: _.keyBy(rooms, '_id')})
}

reducer['socketio-room-messaged'] = (state, {data}) => {
	const message = data
	const roomId = message.room
	const room = state.rooms[roomId]

	// full author object is populated, we just want ID.
	message.author = message.author && message.author._id;

	if (message.edited) {
		const index = _.findIndex(room.$messages, { _id: message._id });

		if (index === -1) return state;

		const $messages = [...room.$messages.slice(0, index), message, ...room.$messages.slice(index + 1)];

		return state.setIn(['rooms', roomId, '$messages'], $messages);
	} else {
		const $messages = [message, ...room.$messages]
		return state.setIn(['rooms',roomId,'$messages'], $messages)
	}
}

export default makeReducer(INITIAL_STATE, reducer)

