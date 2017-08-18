
import { GoogleSignin } from 'react-native-google-signin';
import BunkerSessionClient from './BunkerSessionClient'
import BunkerSessionStore from './BunkerSessionStore'

export default class BunkerSessionManager {

	constructor(serverUri) {
		this.bunkerSessionClient = new BunkerSessionClient(serverUri);
		this.bunkerSessionStore = new BunkerSessionStore(serverUri);
	}

	// Copied from https://github.com/devfd/react-native-google-signin/blob/master/example/index.ios.js
	async signIn() {

		const user = await GoogleSignin.signIn();

		console.log(user);

		await this.bunkerSessionClient.performBunkerSignOn(user.serverAuthCode);

		return user;
	}

	// returns true if user successfully signed out. False otherwise.
	async logUserOutOfApp() {
		try {
			await GoogleSignin.revokeAccess();
			await this.signOut();

			return true;
		}
		catch (err) {
			console.error(err);
			return false;
		}
	}

	async setupGoogleSignin() {
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

			if (user) {
				console.log('have user, restoring and validating session.');

				const isSessionValid = await this._restoreAndValidateSession();

				// Sign the user out and make them sign back in again.
				if (!isSessionValid) {
					console.log('session not valid! signing user out');

					await this.signOut();

					// this.setState({ user: null, viewState: 'signIn' });

					return { user: null, error: false };
				}

				console.log('user valid, connecting...');

				// this.setState({ viewState: 'homeScreen' });

				return { user: user, error: false };
			}
		}
		catch(err) {
			console.log("Google signin error", err.code, err.message);
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
