import React from 'react'
import {StatusBar, StyleSheet, View, Text} from 'react-native'
import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin'
import {connect} from 'react-redux'
import AppNavigator from './AppNavigator'
import {login} from '../user/userReducer'
import BunkerSessionManager from '../../shared/BunkerSessionManager'
const serverUri = `http://localhost:9002`

class RootContainer extends React.PureComponent {

	constructor(props) {
		super(props)

		this.state = {
			viewState: 'loading'
		}

		this.createAndConnectWebSocket = this.createAndConnectWebSocket.bind(this)
		this.bunkerSessionManager = new BunkerSessionManager(serverUri)
	}

	componentDidMount() {
		this._initializeSignin();
	}

	async _initializeSignin() {
		try {
			const sessionSetupResult = await this.bunkerSessionManager.setupGoogleSignin();

			if (sessionSetupResult.error) {
				// TODO: error handling
			}

			if (sessionSetupResult.user) {
				await this.createAndConnectWebSocket();

				login(sessionSetupResult.user)
				this.setState({user: sessionSetupResult.user, viewState: 'homeScreen'});
			}
			else {
				login(null)
				this.setState({ user: null, viewState: 'signIn' });
			}
		}
		catch (err) {
			console.log('error initializing ' + err);
			// TODO: error handling
		}
	}

	async _signIn() {

		this.setState({ viewState: 'loading' });

		const user = await this.bunkerSessionManager.signIn();

		this.setState({ user, viewState: 'homeScreen' });

		await this.createAndConnectWebSocket();
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
