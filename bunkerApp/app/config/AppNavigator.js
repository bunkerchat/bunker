import {StackNavigator, addNavigationHelpers} from "react-navigation"
import React from 'react'
import {connect} from 'react-redux'
import LoginScreen from '../user/LoginScreen'
import RoomScreen from '../rooms/RoomScreen'
import RoomDrawer from '../rooms/RoomDrawer'
import {View} from 'react-native'

export const AppNavigator = StackNavigator({
	// Room: {screen: RoomScreen},
	Room: {screen: RoomDrawer},
	Login: {screen: LoginScreen}
})

class AppWithNavigationState extends React.PureComponent {

	// onNavigationStateChange (prevState, currentState) {
	// 	const {dispatch} = this.props
	// }

	render() {
		const {dispatch, nav} = this.props
		const navigation = addNavigationHelpers({dispatch, state: nav})
		return <AppNavigator navigation={navigation}/>

		// if (this.props.rooms) {
		// 	const Test = RoomDrawer(this.props.rooms);
		// 	return <Test navigation={navigation} />
		// }
		// else {
		// 	return <View></View>
		// }
	}
}

const mapStateToProps = (state) => ({nav: state.nav, rooms: state.room.rooms })
const mapDispatchToProps = dispatch => ({dispatch})


// export default AppNavigator

export default connect(mapStateToProps, mapDispatchToProps)(AppWithNavigationState)
