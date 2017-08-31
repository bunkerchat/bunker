import {combineReducers} from 'redux'
import nav from './navReducer'
import room from '../rooms/roomReducer'
import user from '../user/userReducer'

export const reducers = {
	nav,
	room,
	user
}

export default combineReducers(reducers)
