import React from 'react';
import Room from '../room/Room.jsx';
import Lobby from '../lobby/Lobby.jsx';
import Header from '../header/Header.jsx';
import {connect} from 'react-redux';
import {init} from '../../actions/init';
import styled from 'styled-components'

const ChatContainer = styled.div`
	padding-top: 60px;
`;

const mapStateToProps = (state, ownProps) => {
	const roomMatch = /room\/(\w+)/i.exec(ownProps.location.pathname);
	return {
		rooms: state.rooms,
		currentRoomId: roomMatch ? roomMatch[1] : null
	};
};

const mapDispatchToProps = dispatch => ({
	load: () => {
		dispatch(init());
	}
});

class Chat extends React.Component {
	componentWillMount() {
		this.props.load();
	}

	render() {
		const {currentRoomId, rooms} = this.props;

		if (rooms.length === 0) {
			return <div>Loading...</div>;
		}

		return (
			<div>
				<Header/>
				<ChatContainer>
					<div className={!currentRoomId ? 'd-block' : 'd-none'}>
						<Lobby/>
					</div>
					{_.map(rooms, (room, roomId) => (
						<div className={currentRoomId === roomId ? 'd-block' : 'd-none'} key={roomId}>
							<Room room={room}/>
						</div>
					))}
				</ChatContainer>
			</div>
		)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
