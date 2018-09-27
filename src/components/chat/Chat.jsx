import React from "react";
import Room from "../room/Room.jsx";
import Lobby from "../lobby/Lobby.jsx";
import Settings from "../settings/Settings.jsx";
import Header from "../header/Header.jsx";
import { connect } from "react-redux";
import styled from "styled-components";
import theme from "../../constants/theme";

const ChatContainer = styled.div`
	padding-top: ${theme.top}px;
`;

const mapStateToProps = (state, ownProps) => {
	const sectionMatch = /2\/(\w+)/.exec(ownProps.location.pathname);
	const roomMatch = /room\/(\w+)/i.exec(ownProps.location.pathname);
	return {
		loaded: state.user.loaded,
		section: sectionMatch ? sectionMatch[1] : null,
		rooms: state.rooms,
		currentRoomId: roomMatch ? roomMatch[1] : null
	};
};

class Chat extends React.Component {
	render() {
		const { loaded, section, currentRoomId, rooms } = this.props;

		if (!loaded) {
			return <div>Loading...</div>;
		}

		return (
			<div>
				<Header currentRoomId={currentRoomId} />
				<ChatContainer>
					{section === "settings" && <Settings />}
					{section === "lobby" && <Lobby />}
					{section === "room" &&
						_.map(rooms, (room, roomId) => (
							<div className={currentRoomId === roomId ? "d-block" : "d-none"} key={roomId}>
								<Room roomId={roomId} current={currentRoomId === roomId} />
							</div>
						))}
				</ChatContainer>
			</div>
		);
	}
}

export default connect(mapStateToProps)(Chat);
