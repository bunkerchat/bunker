import React from 'react';
import Room from '../room/Room.jsx';
import Lobby from '../lobby/Lobby.jsx';
import Settings from '../settings/Settings.jsx';
import Header from '../header/Header.jsx';
import {connect} from 'react-redux';
import {init} from '../../actions/init';
import styled from 'styled-components';
import theme from "../../constants/theme";

const ChatContainer = styled.div`
	padding-top: ${theme.top};
`;

const mapStateToProps = (state, ownProps) => {
	const sectionMatch = /2\/(\w+)/.exec(ownProps.location.pathname);
	const roomMatch = /room\/(\w+)/i.exec(ownProps.location.pathname);
	return {
		section: sectionMatch ? sectionMatch[1] : null,
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
		const {section, currentRoomId, rooms} = this.props;

		if (rooms.length === 0) {
			return <div>Loading...</div>;
		}

		return (
			<div>
				<Header/>
				<ChatContainer>
					{section === 'settings' &&
					<Settings/>
					}
					{section === 'lobby' &&
					<Lobby/>
					}
					{section === 'room' && _.map(rooms, (room, roomId) => (
						<div className={currentRoomId === roomId ? 'd-block' : 'd-none'} key={roomId}>
							<Room roomId={roomId} current={currentRoomId === roomId}/>
						</div>
					))}
				</ChatContainer>
			</div>
		)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
