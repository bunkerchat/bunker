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

	if (message.edited) {

	} else {
		const $messages = [message, ...room.$messages]
		return state.setIn(['rooms',roomId,'$messages'], $messages)
	}
}

export default makeReducer(INITIAL_STATE, reducer)

