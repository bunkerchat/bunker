import {login} from '../user/userReducer'
import {managerSignIn, setupGoogleSignin} from './BunkerSessionManager'
import {getBunkerSessionCookie, saveBunkerSession} from './BunkerSessionStore'
import {connectToServer, sendSocketIoMessage} from './socketio'

export const createAndConnectWebSocket = async (dispatch) => {
	// first need to get the cookie so we can pass it down to the socket.
	const cookieResult = getBunkerSessionCookie()

	// connect to server
	await dispatch(connectToServer(cookieResult.cookieValue, cookieResult.header))

	// successfully created socket, now save off cookie as we know it's valid (maybe...)
	await saveBunkerSession(cookieResult.cookieValue)
}

export const initializeSignIn = () => (dispatch) => {
	return setupGoogleSignin()
		.then(sessionSetupResult => {
			if (sessionSetupResult.error) {
				// TODO: error handling
			}

			dispatch(login(sessionSetupResult.user))
			return createAndConnectWebSocket(dispatch)
		})
		.then(() => {
			return fetchInitData(dispatch)
		})
		.catch(console.error)
}

export const signIn = () => async (dispatch) => {
	const user = await managerSignIn();
	dispatch(login(user))
	return createAndConnectWebSocket(dispatch)
}

export const fetchInitData = dispatch => {

	return sendSocketIoMessage('/init')
		.then(initialData => {
			dispatch({type:'socketio-init', ...initialData})
			// const room = initialData.rooms[0]; //_.find(initialData.rooms, {_id: '54490412e7dde30200eb8b41'})
      //
			// const messages = room.$messages
      //
			// console.log('+++++++++++')
			// console.log(messages[0])
		})


	// self.setState({bunkerConnected: true})
}
