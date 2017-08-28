import {LayoutAnimation} from 'react-native'
import {NavigationActions} from 'react-navigation'
import {AppNavigator} from './AppNavigator'

export default (state, action) => {
	if (state && state.asMutable) {
		state = state.asMutable({deep: true})
	}
	const newState = AppNavigator.router.getStateForAction(action, state)
	return newState || state
}
