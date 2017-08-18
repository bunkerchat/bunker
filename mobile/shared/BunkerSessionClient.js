

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
}
