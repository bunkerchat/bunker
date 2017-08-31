import React from 'react'
import {StatusBar, StyleSheet, View, Text, Button} from 'react-native'
import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';
import {connect} from 'react-redux'
import {login} from './userReducer'

class LoginScreen extends React.PureComponent{
	static navigationOptions = {
		title: 'Login',
	}

	_renderLoggedInUser(){
		const {loggedInUser} = this.props
		return <Text>{JSON.stringify(loggedInUser, null, 2)}</Text>
	}

	_renderLoginButton(){
		return <GoogleSigninButton
			style={{width: 48, height: 48}}
			size={GoogleSigninButton.Size.Icon}
			color={GoogleSigninButton.Color.Dark}
			onPress={this._signIn.bind(this)}/>
	}

	async _setupGoogleSignin() {
		try {
			await GoogleSignin.hasPlayServices({ autoResolve: true });
			await GoogleSignin.configure({
				iosClientId: '603421766430-mjg34tcspqcio7eld8hu4djv5vjdvtsr.apps.googleusercontent.com',
				webClientId: '603421766430-60og8n04mebic8hi49u1mrcmcdmugnd5.apps.googleusercontent.com',
				offlineAccess: false
			});

			const user = await GoogleSignin.currentUserAsync();
			console.log(user);
			this.setState({user});
		}
		catch(err) {
			console.log("Google signin error", err.code, err.message);
		}
	}

	_signIn() {
		GoogleSignin.signIn()
			.then((user) => {
				console.log(user);
				this.setState({user: user});
			})
			.catch((err) => {
				console.log('WRONG SIGNIN', err);
			})
			.done();
	}

	_signOut() {
		GoogleSignin.revokeAccess().then(() => GoogleSignin.signOut()).then(() => {
			this.setState({user: null});
		})
			.done();
	}

	render(){
		const {loggedInUser} = this.props

		return <View>
			{loggedInUser && this._renderLoggedInUser()}
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
