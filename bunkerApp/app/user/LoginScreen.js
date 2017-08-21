import React from 'react'
import {StatusBar, StyleSheet, View, Text} from 'react-native'
import {connect} from 'react-redux'

class LoginScreen extends React.PureComponent{
	static navigationOptions = {
		title: 'Login',
	}

	render(){
		return <View>
			<Text> Hello World </Text>
		</View>
	}
}

const style = StyleSheet.create({

})

const mapStateToProps = (state, props) => {
	return {}
}

const actions = {}

export default connect(mapStateToProps, actions)(LoginScreen)
