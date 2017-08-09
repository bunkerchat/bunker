import React from 'react'
import {
	Platform,
	StyleSheet,
	Text,
	View,
	TouchableOpacity
} from 'react-native'

import _ from 'lodash'
import SocketIOClient from 'socket.io-client'
import {GiftedChat, Actions, Bubble} from 'react-native-gifted-chat'
import CustomActions from './CustomActions'
import CustomView from './CustomView'

import CookieManager from 'react-native-cookies'

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
		if (!this.state.user) {

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

		if (this.state.user) {
			return (
				<View style={styles.container}>
					<Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 20}}>Welcome {this.state.user.name}</Text>
					<Text>Your email is: {this.state.user.email}</Text>

					{this.state.bunkerConnected &&
						<Text>Connected!</Text>
					}

					<TouchableOpacity onPress={() => {this._signOut(); }}>
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
	_signIn() {

		const self = this;

		GoogleSignin.signIn()
			.then((user) => {
				console.log(user);
				this.setState({ user });

				return this.performBunkerSignOn(user.serverAuthCode);
			})
			.then(() => {
				self.createAndConnectWebSocket();
			})
			.catch((err) => {
				console.log('WRONG SIGNIN', err);
			})
			.done();
	}

	performBunkerSignOn(serverAuthCode) {

		return this.authenticateWithServer(serverAuthCode)
			.then(this.touchHomepage)
			.catch((err) => alert(`error authenticating with Bunker!\n${err}`))
	}

	authenticateWithServer(serverAuthCode) {
		return fetch(`${serverUri}/auth/googleCallback`, {
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

	createAndConnectWebSocket() {
		const self = this;

		self.getBunkerSessionCookie((cookie, header) => {

			self.createSocket(cookie, header, () => {

				self.fetchInitData((initialData) => {

					const room = initialData.rooms[0]; //_.find(initialData.rooms, {_id: '54490412e7dde30200eb8b41'})

					const messages = room.$messages

					console.log('+++++++++++')
					console.log(messages[0])

					self.setState({ bunkerConnected: true })
				})
			})
		});
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
			this.setState({user});

			if (user) {
				console.log('have user, going to socket');
				// TODO: need to figure out what to do here.
				// touching homepage to re-init session if needed.
				// Note that fetch API doesn't persist cookie quite the way that's expected, so this won't work after
				// rebooting the simulator. Will need to figure out another way to store session cookie.
				this.touchHomepage()
					.then(this.createAndConnectWebSocket);
			}
		}
		catch(err) {
			console.log("Google signin error", err.code, err.message);
		}
	}

	_signOut() {
		GoogleSignin.revokeAccess().then(() => GoogleSignin.signOut()).then(() => {
			this.setState({user: null});
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

	// TODO: could probably promisfy this.
	// calls callback with both the cookie value and a cookie header value.
	getBunkerSessionCookie(cb) {

		const cookieName = 'connect.sid';

		CookieManager.get(serverUri, (err, res) => {

			const connectCookieHeader = `connect.sid=${res[cookieName]}`;

			console.log(res);

			cb(res[cookieName], connectCookieHeader)
		})
	}

	// TODO: promisfy this.
	createSocket(cookie, cookieHeader, cb) {

		this.socket = SocketIOClient(serverUri, { extraHeaders: { 'cookie': cookieHeader }, jsonp: false, transports: ['websocket']})

		this.socket.on('connect', () => {

			cb();
		})
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
