import _ from 'lodash'
import Immutable from 'seamless-immutable'
import {makeReducer} from '../config/reduxTools'

const INITIAL_STATE = Immutable({
	loggedInUser: null,
	userSettings: null,
	currentBunkerUser: null,
	users: null
})

const reducer = {}

export const login = loggedInUser => ({type: 'user/login', loggedInUser})
reducer['user/login'] = (state, {loggedInUser}) => state.merge({loggedInUser})

reducer['socketio-init'] = (state, {userSettings, users, user}) => {
	return state.merge({userSettings, users: _.keyBy(users, '_id'), currentBunkerUser: user})
}

export default makeReducer(INITIAL_STATE, reducer)
