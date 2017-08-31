import {login} from '../user/userReducer'
import {setupGoogleSignin} from './BunkerSessionManager'
import {createAndConnectWebSocket} from './BunkerSessionClient'

export const initializeSignIn = () => (dispatch) => {
	// try {
	const sessionSetupResult = setupGoogleSignin()
		.then(sessionSetupResult => {
			if (sessionSetupResult.error) {
				// TODO: error handling
			}

			if (sessionSetupResult.user) {
				return createAndConnectWebSocket()
					.then(() => sessionSetupResult.user)
			}
		})
		.then(user => {
			dispatch(login(user))
		})
		.catch(console.error)
}
