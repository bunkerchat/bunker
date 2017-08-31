

export default class BunkerSessionClient {

	constructor(serverUri) {
		this.serverUri = serverUri;
	}

	// This is a hack needed to call the 'isLoggedIn' policy which configures the web socket session correctly.
	// Might be able to get rid of this by moving the policy to some middleware. Also, this might actually need
	// to be called in situations where the user is logged in to reset the connect.sid session cookie.
	touchHomepage() {
		return fetch(`${this.serverUri}/`, {
			credentials: 'include'
		});
	}

	async performBunkerSignOn(serverAuthCode) {
		await this.authenticateWithServer(serverAuthCode);
		await this.touchHomepage();
	}

	async authenticateWithServer(serverAuthCode) {
		await fetch(`${this.serverUri}/auth/googleCallback?client=mobile`, {
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
	async validateSessionCookie() {
		try {
			const response = await fetch(`${this.serverUri}/`, {
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

			self.setState({bunkerConnected: true})
		})
	}

	createSocket(cookie, cookieHeader) {
		return new Promise((resolve, reject) => {
			this.socket = SocketIOClient(serverUri,
				{
					query: `bsid=${base64.encode(cookie)}`,
					extraHeaders: {'cookie': cookieHeader},
					jsonp: false,
					transports: ['websocket']
				});

			this.socket.on('connect', () => {
				resolve();
			});

			// TODO: error scenarios
		});
	}
}
