import {AsyncStorage} from 'react-native'

import CookieManager from 'react-native-cookies'
import {serverUri} from '../config/configVariables'

// return true if cookie was restored, false otherwise.
export async function getBunkerSessionCookie() {
	const cookieName = 'connect.sid';

	const cookiesForHost = await CookieManager.get(serverUri)
	const connectCookieHeader = `connect.sid=${cookiesForHost[cookieName]}`;
	return {cookieValue: cookiesForHost[cookieName], header: connectCookieHeader}
}

export async function saveBunkerSession(cookieValue) {
	await AsyncStorage.setItem('bunkerSessionCookie', cookieValue);
}

export async function removeBunkerSession() {
	await AsyncStorage.removeItem('bunkerSessionCookie');
}

async function setBunkerCookie(cookieValue) {
	return CookieManager.setFromResponse(serverUri, {'connect.sid': cookieValue})
	// return new Promise(resolve => {
	// 	// TODO: this doesn't appear to be working properly, find out why.
	// 	return CookieManager.setFromResponse(serverUri, {'connect.sid': cookieValue}, (result) => {
	// 		resolve(result);
	// 	});
	// });
}

// Need to investigate why restoring cookie using react-native cookies isn't working. Until it is working,

// this method doesn't do anything useful.
async function restoreBunkerSession() {
	const cookieValue = await AsyncStorage.getItem('bunkerSessionCookie');

	if (cookieValue) {
		// set this here so it gets picked up by fetch api
		await setBunkerCookie(cookieValue);

		return true;
	}

	return false;
}
