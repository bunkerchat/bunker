export function makeReducer(initialState, reducerMap = {}) {
	return (state = initialState, {type = '', ...payload}) => {
		return (reducerMap[type] || (() => state))(state, payload)
	}
}
