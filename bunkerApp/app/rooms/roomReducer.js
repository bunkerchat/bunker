import Immutable from 'seamless-immutable'
import {makeReducer} from '../config/reduxTools'

const INITIAL_STATE = Immutable({
	rooms: null
})
const reducer = {}

reducer['socketio-init'] = (state, {rooms}) => state.merge({rooms})

export default makeReducer(INITIAL_STATE, reducer)
