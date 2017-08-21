import {combineReducers} from 'redux'
import room from './rooms/roomReducer'
import user from './user/userReducer'

export const reducers = {
	room,
	user
}

export default rootReducer = combineReducers(reducers)

export function makeReducer(initialState, reducerMap = {}) {
	return (state = initialState, {type = '', ...payload}) => {
		return (reducerMap[type] || (() => state))(state, payload)
	}
}
