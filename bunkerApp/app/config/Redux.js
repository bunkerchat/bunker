import {combineReducers} from 'redux'
import nav from './navReducer'
import room from '../rooms/roomReducer'
import user from '../user/userReducer'

export const reducers = {
	nav,
	room,
	user
}

export default rootReducer = combineReducers(reducers)

export function makeReducer(initialState, reducerMap = {}) {
	return (state = initialState, {type = '', ...payload}) => {
		return (reducerMap[type] || (() => state))(state, payload)
	}
}
