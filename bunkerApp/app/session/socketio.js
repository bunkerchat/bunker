import base64 from 'base-64'
import _ from 'lodash'
import SocketIOClient from 'socket.io-client'
import {serverUri} from '../config/configVariables'

const socketioEvents = ['connect', 'room', 'user', 'roommember', 'user_roommember', 'inboxMessage', 'reconnect', 'disconnect']

let socket

export const connectToServer = (cookie, cookieHeader) => async (dispatch) => {
	return new Promise((resolve, reject) => {
		socket = SocketIOClient(serverUri,
			{
				query: `bsid=${base64.encode(cookie)}`,
				extraHeaders: {'cookie': cookieHeader},
				jsonp: false,
				transports: ['websocket']
			});

		socket.on('connect', () => {
			resolve()
		});

		_.each(socketioEvents, eventType => {
			socket.on(eventType, event => {
				event = event || {}

				// socketio firing this without event sometimes, I don't know why :-(
				const socketEvent = eventType || JSON.stringify(event)

				// socket.io internal events are usually not objects
				if (!_.isObject(event)) {
					event = {event: event}
				}

				// split the data from the event object to flatten it a bit for the redux action
				const {data, ..._event} = event
				const verb = event.verb ? `-${event.verb}` : ''
				let action = {type: `socketio-${socketEvent}${verb}`, _event, data}
				dispatch(action)
			})
		})

		// TODO: error scenarios
	});
}

export async function sendSocketIoMessage(route, message) {
	message = message || {}
	return new Promise(resolve => socket.emit(route, message, resolve))
}
