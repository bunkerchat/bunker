import Immutable from 'seamless-immutable'
import {makeReducer} from '../config/Redux'

const INITIAL_STATE = Immutable({
	loggedInUser: null
})

const reducer = {}

export const login = loggedInUser => ({type: 'user/login', loggedInUser})
reducer['user/login'] = (state, {loggedInUser}) => {
	loggedInUser.derp = "foobar"
	return state.merge({loggedInUser})
}

export default makeReducer(INITIAL_STATE, reducer)
