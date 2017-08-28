import {StackNavigator, addNavigationHelpers} from "react-navigation"
import React from 'react'
import {connect} from 'react-redux'
import LoginScreen from '../user/LoginScreen'

export const AppNavigator = StackNavigator({
	Login: {screen: LoginScreen},
	// Chat: { screen: ChatScreen },
})

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

const mapStateToProps = (state) => ({nav: state.nav})
const mapDispatchToProps = dispatch => ({dispatch})


// export default AppNavigator

export default connect(mapStateToProps, mapDispatchToProps)(AppWithNavigationState)
