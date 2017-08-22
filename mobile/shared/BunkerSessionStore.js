
import {AsyncStorage} from 'react-native'

import CookieManager from 'react-native-cookies'


export default class BunkerSessionManager {

	constructor(serverUri) {
		this.serverUri = serverUri;
	}

	async saveBunkerSession(cookieValue) {
		await AsyncStorage.setItem('bunkerSessionCookie', cookieValue);
	}

	async removeBunkerSession() {
		await AsyncStorage.removeItem('bunkerSessionCookie');
	}

	setBunkerCookie(cookieValue) {
		return new Promise(resolve => {
			// TODO: this doesn't appear to be working properly, find out why.
			CookieManager.setFromResponse(this.serverUri, { 'connect.sid': cookieValue }, (result) => {
				resolve(result);
			});
		});
	}

	// return true if cookie was restored, false otherwise.
	// Need to investigate why restoring cookie using react-native cookies isn't working. Until it is working,
	// this method doesn't do anything useful.
	async restoreBunkerSession() {
		const cookieValue = await AsyncStorage.getItem('bunkerSessionCookie');

		if (cookieValue) {
			// set this here so it gets picked up by fetch api
			await this.setBunkerCookie(cookieValue);

			return true;
		}

		return false;
	}

	getBunkerSessionCookie() {
		const cookieName = 'connect.sid';

		return new Promise(resolve => {

			CookieManager.get(this.serverUri, (err, cookiesForHost) => {
				const connectCookieHeader = `connect.sid=${cookiesForHost[cookieName]}`;

				resolve({ cookieValue: cookiesForHost[cookieName], header: connectCookieHeader });
			});
		});
	}
}
