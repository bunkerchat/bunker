import React from 'react'
import {StatusBar, StyleSheet, View, Text} from 'react-native'
import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin'
import {connect} from 'react-redux'
import AppNavigator from './AppNavigator'
import {login} from '../user/userReducer'

class RootContainer extends React.PureComponent {

	componentDidMount() {
		this._setupGoogleSignin()
	}

	async _setupGoogleSignin() {
		try {
			await GoogleSignin.hasPlayServices({ autoResolve: true });
			await GoogleSignin.configure({
				iosClientId: '744915257573-1ajg3qgmn4k261i0vdq6ed042c6sba1a.apps.googleusercontent.com',
				webClientId: '744915257573-ri8suktjsu5s1b3jddkacm6k0a45vi02.apps.googleusercontent.com',
				offlineAccess: false
			});

			const {loggedInUser, login} = this.props
			if(loggedInUser) return

			const user = await GoogleSignin.currentUserAsync();
			console.log(user);
			login(user)
		}
		catch(err) {
			console.log("Google signin error", err.code, err.message);
		}
	}

	render() {
		return <View style={styles.applicationView}>
			<StatusBar/>
			<AppNavigator/>
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

const actions = {login}

export default connect(mapStateToProps, actions)(RootContainer)
