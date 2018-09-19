import React from 'react';
import Room from "../room/Room.jsx";
import Lobby from "../lobby/Lobby.jsx";
import Header from "../header/Header.jsx";
import {connect} from "react-redux";
import {getRooms} from "../../actions/rooms";

const mapStateToProps = (state, ownProps) => {
	const roomMatch = /room\/(\w+)/i.exec(ownProps.location.pathname);
	return {
		rooms: state.rooms,
		roomId: roomMatch ? roomMatch[1] : null
	};
};

const mapDispatchToProps = dispatch => ({
	load: () => {
		dispatch(getRooms());
	}
});

class Chat extends React.Component {
	componentWillMount() {
		this.props.load();
	}

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

		if(this.props.rooms.length === 0) {
			return <div>Loading...</div>;
		}

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

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
