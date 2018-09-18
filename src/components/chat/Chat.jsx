import React from 'react';
import Room from "../room/Room.jsx";
import Lobby from "../lobby/Lobby.jsx";
import Header from "../header/Header.jsx";
import {connect} from "react-redux";

const mapStateToProps = (state, ownProps) => {
	const roomMatch = /room\/(\w+)/i.exec(ownProps.location.pathname);
	return {
		roomId: roomMatch ? roomMatch[1] : null
	};
};

class Chat extends React.Component {
	render() {
		const rooms = [{
			_id: '1',
			messages: [
				{_id: '1', text: 'this is the first message'},
				{_id: '2', text: 'this is the second message'},
				{_id: '3', text: 'this is the third message'},
				{_id: '4', text: 'this is the fourth message'},
				{_id: '5', text: 'this is the fifth message'},
			]
		}];

		const {roomId} = this.props;

		return (
			<div>
				<Header/>
				<div className={!roomId ? 'd-block' : 'd-none'}>
					<Lobby/>
				</div>
				{rooms.map(room => (
					<div className={roomId === room._id ? 'd-block' : 'd-none'} key={room._id}>
						<Room room={room}/>
					</div>
				))}
			</div>
		)
	}
}

export default connect(mapStateToProps)(Chat);
