import React from 'react'
import {StatusBar, StyleSheet, View, Text, Button} from 'react-native'
import {connect} from 'react-redux'
import {login} from './userReducer'
import ChatWrapper from '../rooms/ChatWrapper';

class LoginScreen extends React.PureComponent{
	static navigationOptions = {
		title: 'Login',
	}

	_renderLoggedInUser(){
		const {loggedInUser} = this.props
		return <Text>{JSON.stringify(loggedInUser, null, 2)}</Text>
	}

	_renderChatWrapper() {
		return <ChatWrapper/>
	}

	render(){
		const {loggedInUser} = this.props

		return <View>
			{loggedInUser && this._renderChatWrapper()}
			{!loggedInUser && this._renderLoginButton()}
		</View>
	}
}

const style = StyleSheet.create({

})

const mapStateToProps = (state, props) => {
	return {
		loggedInUser: state.user.loggedInUser
	}
}

const actions = {login}

export default connect(mapStateToProps, actions)(LoginScreen)
