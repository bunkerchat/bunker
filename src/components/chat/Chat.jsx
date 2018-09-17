import React from 'react';
import Room from "../room/Room.jsx";
import Lobby from "../lobby/Lobby.jsx";
import Header from "../header/Header.jsx";

export default class Chat extends React.Component {
	render() {
		const rooms = [{
			messages: [
				{
					text: '1'
				},
				{
					text: '2'
				}
			]
		}];
		return (
			<div>
				<Header/>
				<Lobby/>
				{rooms.map(room => <Room room={room}/>)}
			</div>
		)
	}
}
