import React from 'react'
import {
	Platform,
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	AsyncStorage
} from 'react-native'

import _ from 'lodash'
import SocketIOClient from 'socket.io-client'
import {GiftedChat, Actions, Bubble} from 'react-native-gifted-chat'
import CustomActions from './CustomActions'
import CustomView from './CustomView'

import CookieManager from 'react-native-cookies'

import base64 from 'base-64'

import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';

const serverUri = `http://localhost:9002`

export default class Example extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			messages: [],
			loadEarlier: true,
			typingText: null,
			isLoadingEarlier: false,
			viewState: 'loading'
		}

		this._isMounted = false
		this.onSend = this.onSend.bind(this)
		this.onReceive = this.onReceive.bind(this)
		this.renderCustomActions = this.renderCustomActions.bind(this)
		this.renderBubble = this.renderBubble.bind(this)
		this.renderFooter = this.renderFooter.bind(this)
		this.onLoadEarlier = this.onLoadEarlier.bind(this)

		this.createAndConnectWebSocket = this.createAndConnectWebSocket.bind(this)

		this._isAlright = null
	}

	componentWillMount() {
		this._isMounted = true
		this.setState(() => {
			return {
				messages: require('./data/messages.js'),
			}
		})
	}

	componentWillUnmount() {
		this._isMounted = false
	}

	componentDidMount() {
		this._setupGoogleSignin();
	}

	onLoadEarlier() {
		this.setState({isLoadingEarlier: true})

		setTimeout(() => {
			if (this._isMounted === true) {
				this.setState((previousState) => {
					return {
						messages: GiftedChat.prepend(previousState.messages, require('./data/old_messages.js')),
						loadEarlier: false,
						isLoadingEarlier: false,
					}
				})
			}
		}, 1000) // simulating network
	}

	onSend(messages = []) {
		this.setState((previousState) => {
			return {
				messages: GiftedChat.append(previousState.messages, messages),
			}
		})

		// for demo purpose
		this.answerDemo(messages)
	}

	answerDemo(messages) {
		if (messages.length > 0) {
			if ((messages[0].image || messages[0].location) || !this._isAlright) {
				this.setState((previousState) => {
					return {
						typingText: 'React Native is typing'
					}
				})
			}
		}

		setTimeout(() => {
			if (this._isMounted === true) {
				if (messages.length > 0) {
					if (messages[0].image) {
						this.onReceive('Nice picture!')
					} else if (messages[0].location) {
						this.onReceive('My favorite place')
					} else {
						if (!this._isAlright) {
							this._isAlright = true
							this.onReceive('Alright')
						}
					}
				}
			}

			this.setState((previousState) => {
				return {
					typingText: null,
				}
			})
		}, 1000)
	}

	onReceive(text) {
		this.setState((previousState) => {
			return {
				messages: GiftedChat.append(previousState.messages, {
					_id: Math.round(Math.random() * 1000000),
					text: text,
					createdAt: new Date(),
					user: {
						_id: 2,
						name: 'React Native',
						// avatar: 'https://facebook.github.io/react/img/logo_og.png',
					},
				}),
			}
		})
	}

	renderCustomActions(props) {
		if (Platform.OS === 'ios') {
			return (
				<CustomActions
					{...props}
				/>
			)
		}
		const options = {
			'Action 1': (props) => {
				alert('option 1')
			},
			'Action 2': (props) => {
				alert('option 2')
			},
			'Cancel': () => {
			},
		}
		return (
			<Actions
				{...props}
				options={options}
			/>
		)
	}

	renderBubble(props) {
		return (
			<Bubble
				{...props}
				wrapperStyle={{
					left: {
						backgroundColor: '#f0f0f0',
					}
				}}
			/>
		)
	}

	renderCustomView(props) {
		return (
			<Text>
				test
			</Text>
		)
	}

	renderFooter(props) {
		if (this.state.typingText) {
			return (
				<View style={styles.footerContainer}>
					<Text style={styles.footerText}>
						{this.state.typingText}
					</Text>
				</View>
			)
		}
		return null
	}

	render() {
		if (this.state.viewState === 'loading') {
			return (
				<View style={styles.container}>
					<Text>Loading!!!</Text>
				</View>
			)
		}

		if (this.state.viewState === 'signIn') {
			return (
				<View style={styles.container}>
					<GoogleSigninButton
						style={{width: 212, height: 48}}
						size={GoogleSigninButton.Size.Standard}
						color={GoogleSigninButton.Color.Auto}
						onPress={this._signIn.bind(this)}/>
				</View>
			)
		}

		if (this.state.viewState === 'homeScreen') {
			return (
				<View style={styles.container}>
					<Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 20}}>Welcome {this.state.user.name}</Text>
					<Text>Your email is: {this.state.user.email}</Text>

					{this.state.bunkerConnected &&
						<Text>Connected!</Text>
					}

					<TouchableOpacity onPress={() => {this.logUserOutOfApp(); }}>
						<View style={{marginTop: 50}}>
							<Text>Log out</Text>
						</View>
					</TouchableOpacity>
				</View>
			);
		}
	}

	renderGiftedChat() {
		return (
			<GiftedChat
				messages={this.state.messages}
				onSend={this.onSend}
				loadEarlier={this.state.loadEarlier}
				onLoadEarlier={this.onLoadEarlier}
				isLoadingEarlier={this.state.isLoadingEarlier}

				user={{
					_id: 1, // sent messages should have same user._id
				}}

				renderActions={this.renderCustomActions}
				renderBubble={this.renderBubble}
				renderCustomView={this.renderCustomView}
				renderFooter={this.renderFooter}
			/>
		)
	}

	// Copied from https://github.com/devfd/react-native-google-signin/blob/master/example/index.ios.js
	async _signIn() {

		const user = await GoogleSignin.signIn();

		console.log(user);

		this.setState({ viewState: 'loading' });

		await this.performBunkerSignOn(user.serverAuthCode);

		this.setState({ user, viewState: 'homeScreen' });

		await this.createAndConnectWebSocket();
	}

	async _setupGoogleSignin() {
		try {
			await GoogleSignin.hasPlayServices({ autoResolve: true });
			await GoogleSignin.configure({
				iosClientId: '618885628861-t08otgtft1n229tdb3dje74eeull8slh.apps.googleusercontent.com',
				webClientId: '618885628861-8j3qt047v1p2g6q528bm6ihdchpohe94.apps.googleusercontent.com',
				// iosClientId: '603421766430-mjg34tcspqcio7eld8hu4djv5vjdvtsr.apps.googleusercontent.com',
				// webClientId: '603421766430-60og8n04mebic8hi49u1mrcmcdmugnd5.apps.googleusercontent.com',
				offlineAccess: true
			});

			const user = await GoogleSignin.currentUserAsync();

			console.log(user);
			this.setState({ user });

			if (user) {
				console.log('have user, restoring and validating session.');

				const isSessionValid = await this.restoreAndValidateSession();

				// Sign the user out and make them sign back in again.
				if (!isSessionValid) {
					console.log('session not valid! signing user out');

					await this.signOut();

					this.setState({ user: null, viewState: 'signIn' });

					return;
				}

				console.log('user valid, connecting...');

				this.setState({ viewState: 'homeScreen' });

				// everything good, try connecting.
				await this.createAndConnectWebSocket();
			}
		}
		catch(err) {
			this.setState({ user: null, viewState: 'signIn' });
			console.log("Google signin error", err.code, err.message);
		}
	}

	async signOut() {
		await AsyncStorage.removeItem('bunkerSessionCookie');
		await GoogleSignin.signOut();
	}

	logUserOutOfApp() {
		GoogleSignin.revokeAccess()
			.then(() => this.signOut())
			.then(() => {
				this.setState({ user: null, viewState: 'signIn' });
			})
			.done();
	}

	// This is a hack needed to call the 'isLoggedIn' policy which configures the web socket session correctly.
	// Might be able to get rid of this by moving the policy to some middleware. Also, this might actually need
	// to be called in situations where the user is logged in to reset the connect.sid session cookie.
	touchHomepage() {
		return fetch(`${serverUri}/`, {
			credentials: 'include'
		});
	}

	async performBunkerSignOn(serverAuthCode) {
		try {
			await this.authenticateWithServer(serverAuthCode);
			await this.touchHomepage();
		}
		catch (err) {
			alert(`error authenticating with Bunker!\n${err}`);
		}
	}

	async authenticateWithServer(serverAuthCode) {
		await fetch(`${serverUri}/auth/googleCallback?client=mobile`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				code: serverAuthCode
			}),
			credentials: 'include'
		});
	}

	async createAndConnectWebSocket() {
		const self = this;

		// first need to get the cookie so we can pass it down to the socket.
		const cookieResult = await self.getBunkerSessionCookie();

		await self.createSocket(cookieResult.cookieValue, cookieResult.header);

		// successfully created socket, now save off cookie as we know it's valid (maybe...)
		await self.saveBunkerSessionCookie(cookieResult.cookieValue);

		self.fetchInitData((initialData) => {

			const room = initialData.rooms[0]; //_.find(initialData.rooms, {_id: '54490412e7dde30200eb8b41'})

			const messages = room.$messages

			console.log('+++++++++++')
			console.log(messages[0])

			self.setState({ bunkerConnected: true })
		})
	}

	getBunkerSessionCookie() {

		const cookieName = 'connect.sid';

		return new Promise(resolve => {

			CookieManager.get(serverUri, (err, cookiesForHost) => {
				const connectCookieHeader = `connect.sid=${cookiesForHost[cookieName]}`;

				console.log(cookiesForHost);

				resolve({ cookieValue: cookiesForHost[cookieName], header: connectCookieHeader });
			});
		});
	}

	// returns true if bunker session can be restored and is still valid. False otherwise.
	async restoreAndValidateSession() {
		// TODO: this is what should be done to restore bunker cookie from async storage. However, doesn't work
		// because of issues with react-native cookies (or some other reason).
		//
		// const restoreResult = await this.restoreBunkerSessionCookie();
        //
		// if (!restoreResult) {
		// 	console.log('no session was restored.');
		// 	return false;
		// }

		const validateCookieResult = await this.validateSessionCookie();

		return validateCookieResult;
	}

	async saveBunkerSessionCookie(cookieValue) {
		await AsyncStorage.setItem('bunkerSessionCookie', cookieValue);
	}

	// Just visit the homepage. If we get a redirect, session is invalid. Otherwise, it's valid.
	// Huge hack, probably need a server endpoint to truly validate the session. Another option may be to check for
	// set-cookie header or something and update the stored cookie value.
	async validateSessionCookie() {
		try {
			const response = await fetch(`${serverUri}/`, {
				credentials: 'include',
				redirect: 'manual' // TODO: react-native doesn't seem to honor this parameter.
			});

			console.log('url ' + response.url);

			if (/\/login/ig.test(response.url)) {
				console.log('not validated, returning false from validate');
				return false;
			}

			console.log('validated, returning true from validate')

			return true;
		}
		catch (error) {
			console.log('not validated, returning false from validate');
			return false;
		}
	}

	setBunkerCookie(cookieValue) {
		return new Promise(resolve => {
			// TODO: this doesn't appear to be working properly, find out why.
			CookieManager.setFromResponse(serverUri, { 'connect.sid': cookieValue }, (result) => {
				resolve(result);
			});
		});
	}

	// return true if cookie was restored, false otherwise.
	// Need to investigate why restoring cookie using react-native cookies isn't working. Until it is working,
	// this method doesn't do anything useful.
	async restoreBunkerSessionCookie() {
		const cookieValue = await AsyncStorage.getItem('bunkerSessionCookie');

		if (cookieValue) {
			// set this here so it gets picked up by fetch api
			await this.setBunkerCookie(cookieValue);

			console.log('returning true for restore.')
			return true;
		}

		console.log('returning false from restore');
		return false;
	}

	createSocket(cookie, cookieHeader) {
		return new Promise((resolve, reject) => {
			this.socket = SocketIOClient(serverUri,
				{
					query: `bsid=${base64.encode(cookie)}`,
					extraHeaders: { 'cookie': cookieHeader },
					jsonp: false,
					transports: ['websocket']
				});

			this.socket.on('connect', () => {
				resolve();
			});

			// TODO: error scenarios
		});
	}

	// TODO: can probably promisfy this
	fetchInitData(cb) {
		this.socket.emit('/init', {}, initialData => {

			cb(initialData);

			// _.each(messages, message => {
			// 	const user = _.find(initialData.users, {_id: message.author}) || {_id: -1, name: 'SYSTEM'}
			// 	user.name = user.nick
			//
			// 	message.user = user
			// })
			//
			// this.setState({messages: room.$messages})
		})
	}
}

const styles = StyleSheet.create({
	footerContainer: {
		marginTop: 5,
		marginLeft: 10,
		marginRight: 10,
		marginBottom: 10,
	},
	footerText: {
		fontSize: 14,
		color: '#aaa',
	},
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F5FCFF',
	},
	welcome: {
		fontSize: 20,
		textAlign: 'center',
		margin: 10,
	},
	instructions: {
		textAlign: 'center',
		color: '#333333',
		marginBottom: 5,
	},
})
