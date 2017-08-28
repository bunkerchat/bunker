import Immutable from 'seamless-immutable'
import {makeReducer} from '../config/Redux'

const INITIAL_STATE = Immutable({
	user: null
})

const reducer = {}

export const login = user => ({type: 'user/login', user})
reducer['user/login'] = (state, {user}) => state.merge({user})

export default makeReducer(INITIAL_STATE, reducer)
