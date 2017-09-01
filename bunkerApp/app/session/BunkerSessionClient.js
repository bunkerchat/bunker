import {serverUri} from '../config/configVariables'

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

async function logUserOutOfApp() {
	const {login} = this.props
	await this.bunkerSessionManager.logUserOutOfApp();
	login(null)
	// this.setState({user: null, viewState: 'signIn'});
}
