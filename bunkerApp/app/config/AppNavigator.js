import { StackNavigator } from "react-navigation"
import LoginScreen from '../user/LoginScreen'

const AppNavigator = StackNavigator({
	Login: { screen: LoginScreen },
	// Chat: { screen: ChatScreen },
})


export default AppNavigator
