import Immutable from 'seamless-immutable'
import {makeReducer} from '../config/reduxTools'

const INITIAL_STATE = Immutable({})
const reducer = {}

export function derp (foo, bar) {
	return {type:'room/derp', foo, bar}
}

reducer['room/derp'] = (state, {foo, bar}) =>{
	return state.merge(foo)
}

export default makeReducer(INITIAL_STATE, reducer)
