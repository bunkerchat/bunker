
import { GoogleSignin } from 'react-native-google-signin';
import BunkerSessionClient from './BunkerSessionClient'
import BunkerSessionStore from './BunkerSessionStore'

export default class BunkerSessionManager {

	constructor(serverUri) {
		this.bunkerSessionClient = new BunkerSessionClient(serverUri);
		this.bunkerSessionStore = new BunkerSessionStore(serverUri);
	}

	// Copied from https://github.com/devfd/react-native-google-signin/blob/master/example/index.ios.js
	// Sign a user in to google, and then to bunker. Returns the authenticated user.
	async signIn() {

		const user = await GoogleSignin.signIn();

		await this.bunkerSessionClient.performBunkerSignOn(user.serverAuthCode);

		return user;
	}

	// returns true if user successfully signed out. throws otherwise.
	async logUserOutOfApp() {
		await GoogleSignin.revokeAccess();
		await this.signOut();

		return true;
	}

	// Determines if a user is already signed in to the app via Google. If user is already signed in, checks to
	// see if we have an existing bunker session. If so, it will attempt to reconnect to the session.
	// Returns an object containing the user as well as a flag denoting if there was an error or not.
	// ex: { user: ..., error: false }
	async setupGoogleSignin() {
		try {
			await GoogleSignin.hasPlayServices({ autoResolve: true });

			await GoogleSignin.configure({
				iosClientId: '744915257573-1ajg3qgmn4k261i0vdq6ed042c6sba1a.apps.googleusercontent.com',
				webClientId: '744915257573-ri8suktjsu5s1b3jddkacm6k0a45vi02.apps.googleusercontent.com',
				offlineAccess: true
			});

			const user = await GoogleSignin.currentUserAsync();

			if (user) {
				const isSessionValid = await this._restoreAndValidateSession();

				// Sign the user out and make them sign back in again.
				if (!isSessionValid) {
					await this.signOut();

					return { user: null, error: false };
				}

				return { user: user, error: false };
			}

			return { user: null, error: false };
		}
		catch(err) {
			return { user: null, error: true };
		}
	}

	async getBunkerSessionCookie() {
		return await this.bunkerSessionStore.getBunkerSessionCookie();
	}

	async saveBunkerSessionCookie(cookie) {
		return await this.bunkerSessionStore.saveBunkerSession(cookie);
	}

	// returns true if bunker session can be restored and is still valid. False otherwise.
	async _restoreAndValidateSession() {
		// TODO: this is what should be done to restore bunker cookie from async storage. However, doesn't work
		// because of issues with react-native cookies (or some other reason).
		//
		// const restoreResult = await this.bunkerSessionStore.restoreBunkerSession();
		//
		// if (!restoreResult) {
		// 	console.log('no session was restored.');
		// 	return false;
		// }

		const validateCookieResult = await this.bunkerSessionClient.validateSessionCookie();

		return validateCookieResult;
	}

	async signOut() {
		await this.bunkerSessionStore.removeBunkerSession();
		await GoogleSignin.signOut();
	}
}
