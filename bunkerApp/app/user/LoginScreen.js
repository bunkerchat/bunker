import React from 'react'
import {StatusBar, StyleSheet, View, Text, Button} from 'react-native'
import {connect} from 'react-redux'
import {login} from './userReducer'

class LoginScreen extends React.PureComponent{
	static navigationOptions = {
		title: 'Login',
	}

	render(){
		const {login} = this.props

		const fakeUser = {
			username: 'jmore',
			email: 'derp@derp.com'
		}

		return <View>
			<Text> Hello World </Text>
			<Button onPress={() => login(fakeUser)} title="Login" />
		</View>
	}
}

const style = StyleSheet.create({

})

const mapStateToProps = (state, props) => {
	return {}
}

const actions = {login}

export default connect(mapStateToProps, actions)(LoginScreen)
