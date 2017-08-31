import SocketIOClient from 'socket.io-client'
import base64 from 'base-64'
import {serverUri} from '../config/configVariables'
import {getBunkerSessionCookie, saveBunkerSession} from './BunkerSessionStore'
import {managerSignIn} from './BunkerSessionManager'

// This is a hack needed to call the 'isLoggedIn' policy which configures the web socket session correctly.
// Might be able to get rid of this by moving the policy to some middleware. Also, this might actually need
// to be called in situations where the user is logged in to reset the connect.sid session cookie.
function touchHomepage() {
	return fetch(`${serverUri}/`, {
		credentials: 'include'
	});
}

export async function performBunkerSignOn(serverAuthCode) {
	await authenticateWithServer(serverAuthCode);
	await touchHomepage();
}

async function authenticateWithServer(serverAuthCode) {
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

// Just visit the homepage. If we get a redirect, session is invalid. Otherwise, it's valid.
// Huge hack, probably need a server endpoint to truly validate the session. Another option may be to check for
// set-cookie header or something and update the stored cookie value.
export async function validateSessionCookie() {
	try {
		const response = await fetch(`${serverUri}/`, {
			credentials: 'include',
			redirect: 'manual' // TODO: react-native doesn't seem to honor this parameter.
		});

		if (/\/login/ig.test(response.url)) {
			console.log('not validated, returning false from validate');
			return false;
		}

		return true;
	}
	catch (error) {
		return false;
	}
}

export async function createAndConnectWebSocket() {
	const self = this;

	// first need to get the cookie so we can pass it down to the socket.
	const cookieResult = await getBunkerSessionCookie();

	await createSocket(cookieResult.cookieValue, cookieResult.header);

	// successfully created socket, now save off cookie as we know it's valid (maybe...)
	await saveBunkerSession(cookieResult.cookieValue);

	await fetchInitData((initialData) => {

		const room = initialData.rooms[0]; //_.find(initialData.rooms, {_id: '54490412e7dde30200eb8b41'})

		const messages = room.$messages

		console.log('+++++++++++')
		console.log(messages[0])

		// self.setState({bunkerConnected: true})
	})
}

let socket

function createSocket(cookie, cookieHeader) {
	return new Promise((resolve, reject) => {
		socket = SocketIOClient(serverUri,
			{
				query: `bsid=${base64.encode(cookie)}`,
				extraHeaders: {'cookie': cookieHeader},
				jsonp: false,
				transports: ['websocket']
			});

		socket.on('connect', () => {
			resolve();
		});

		// TODO: error scenarios
	});
}

export const signIn = () => async (dispatch) => {
	const {login} = this.props
	// this.setState({viewState: 'loading'});

	const user = await managerSignIn();

	dispatch(login(user))
	// this.setState({user, viewState: 'homeScreen'});

	await createAndConnectWebSocket();
}

async function logUserOutOfApp() {
	const {login} = this.props
	await this.bunkerSessionManager.logUserOutOfApp();
	login(null)
	// this.setState({user: null, viewState: 'signIn'});
}

// TODO: can probably promisfy this
async function fetchInitData(cb) {
	socket.emit('/init', {}, initialData => {

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
