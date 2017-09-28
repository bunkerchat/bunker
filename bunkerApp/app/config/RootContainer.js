import React from 'react'
import {StatusBar, StyleSheet, View, Text} from 'react-native'
import {GoogleSigninButton} from 'react-native-google-signin'
import {connect} from 'react-redux'
import AppNavigator from './AppNavigator'
import {login} from '../user/userReducer'
import {initializeSignIn, signIn} from '../session/sessionThunks'

class RootContainer extends React.PureComponent {

	constructor(props) {
		super(props)
	}

	componentDidMount() {
		this.props.initializeSignIn()
	}

	render() {
		const {loggedInUser, signIn} = this.props

		return <View style={styles.applicationView}>
			<StatusBar barStyle="light-content" />
			{loggedInUser && <AppNavigator/>}
			{!loggedInUser && <GoogleSigninButton
				style={{width: 212, height: 48}}
				size={GoogleSigninButton.Size.Standard}
				color={GoogleSigninButton.Color.Auto}
				onPress={() => signIn()}/>}
		</View>
	}
}

const styles = StyleSheet.create({
	applicationView: {
		flex: 1
	}
})

const mapStateToProps = (state, props) => {
	return {
		loggedInUser: state.user.loggedInUser
	}
}

const actions = {login, initializeSignIn, signIn}

export default connect(mapStateToProps, actions)(RootContainer)
