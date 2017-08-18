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

import BunkerSessionManager from './shared/BunkerSessionManager'

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

		this.bunkerSessionManager = new BunkerSessionManager(serverUri)

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
		this._initializeSignin();
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

	async _signIn() {

		this.setState({ viewState: 'loading' });

		const user = await this.bunkerSessionManager.signIn();

		this.setState({ user, viewState: 'homeScreen' });

		await this.createAndConnectWebSocket();
	}

	async _initializeSignin() {
		const sessionSetupResult = await this.bunkerSessionManager.setupGoogleSignin();

		if (sessionSetupResult.error) {
			// TODO: error handling
		}

		if (sessionSetupResult.user) {
			this.setState({ user: sessionSetupResult.user, viewState: 'homeScreen' });
			await this.createAndConnectWebSocket();
		}
		else {
			this.setState({ user: null, viewState: 'signIn' });
		}
	}

	async logUserOutOfApp() {
		await this.bunkerSessionManager.logUserOutOfApp();
		this.setState({ user: null, viewState: 'signIn' });
	}

	async createAndConnectWebSocket() {
		const self = this;

		// first need to get the cookie so we can pass it down to the socket.
		const cookieResult = await self.bunkerSessionManager.getBunkerSessionCookie();

		await self.createSocket(cookieResult.cookieValue, cookieResult.header);

		// successfully created socket, now save off cookie as we know it's valid (maybe...)
		await self.bunkerSessionManager.saveBunkerSessionCookie(cookieResult.cookieValue);

		self.fetchInitData((initialData) => {

			const room = initialData.rooms[0]; //_.find(initialData.rooms, {_id: '54490412e7dde30200eb8b41'})

			const messages = room.$messages

			console.log('+++++++++++')
			console.log(messages[0])

			self.setState({ bunkerConnected: true })
		})
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
