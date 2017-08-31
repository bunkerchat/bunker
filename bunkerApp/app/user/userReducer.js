import Immutable from 'seamless-immutable'
import {makeReducer} from '../config/reduxTools'

const INITIAL_STATE = Immutable({
	loggedInUser: null
})

const reducer = {}

export const login = loggedInUser => ({type: 'user/login', loggedInUser})
reducer['user/login'] = (state, {loggedInUser}) => state.merge({loggedInUser})

export default makeReducer(INITIAL_STATE, reducer)
