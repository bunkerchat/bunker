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
	return {
		loaded: state.localUser.loaded,
		section: sectionMatch ? sectionMatch[1] : null,
		rooms: state.rooms
	};
};

class Chat extends React.Component {
	render() {
		const { loaded, section, rooms } = this.props;

		if (!loaded) {
			return <div>Loading...</div>;
		}

		return (
			<div>
				<Header />
				<ChatContainer>
					{section === "settings" && <Settings />}
					{section === "lobby" && <Lobby />}
					{section === "room" &&
						_.map(rooms, (room, roomId) => (
							<div className={room.current ? "d-block" : "d-none"} key={roomId}>
								<Room roomId={roomId} current={room.current} />
							</div>
						))}
				</ChatContainer>
			</div>
		);
	}
}

export default connect(mapStateToProps)(Chat);
