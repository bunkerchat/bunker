import {StackNavigator, addNavigationHelpers} from "react-navigation"
import React from 'react'
import {connect} from 'react-redux'
import LoginScreen from '../user/LoginScreen'
import RoomScreen from '../rooms/RoomScreen'
import RoomSelector from '../rooms/RoomSelector'

export const AppNavigator = StackNavigator({
	Rooms: {screen: RoomSelector},
	Room: {screen: RoomScreen},
	Login: {screen: LoginScreen}
}, {
	navigationOptions: {
		headerStyle: {
			backgroundColor: '#45494D',
		},
		headerTitleStyle: {
			color: 'white'
		},
		headerBackTitleStyle: {
			color: 'white'
		},
		headerTintColor: 'white'
	}
});

class AppWithNavigationState extends React.PureComponent {

	// onNavigationStateChange (prevState, currentState) {
	// 	const {dispatch} = this.props
	// }

	render() {
		const {dispatch, nav} = this.props
		const navigation = addNavigationHelpers({dispatch, state: nav})
		return <AppNavigator navigation={navigation}/>
	}
}

const mapStateToProps = (state) => ({nav: state.nav })
const mapDispatchToProps = dispatch => ({dispatch})

export default connect(mapStateToProps, mapDispatchToProps)(AppWithNavigationState)
