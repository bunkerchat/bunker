import React from "react";
import Room from "../room/Room.jsx";
import Lobby from "../lobby/Lobby.jsx";
import Settings from "../settings/Settings.jsx";
import Header from "../header/Header.jsx";
import { connect } from "react-redux";
import styled from "styled-components";

const FullScreenContainer = styled.div`
	width: 100vw;
	height: 100vh;
	overflow: hidden;
`;

const ChatContainer = styled.div`
	display: flex;
	flex-direction: column;
`;

const MainContainer = styled.div`
	flex: 1;
`;

const mapStateToProps = (state, ownProps) => {
	const sectionMatch = /2\/(\w+)/.exec(ownProps.location.pathname);
	return {
		loaded: state.localUser.loaded,
		section: sectionMatch ? sectionMatch[1] : null,
		rooms: state.rooms
	};
};

class Chat extends React.PureComponent {
	render() {
		const { loaded, section, rooms } = this.props;

		if (!loaded) {
			return <div>Loading...</div>;
		}

		return (
			<FullScreenContainer>
				<ChatContainer>
					<Header />
					<MainContainer>
						{section === "settings" && <Settings />}
						{section === "lobby" && <Lobby />}
						{section === "room" &&
							_.map(rooms, (room, roomId) => (
								<div className={room.current ? "d-block" : "d-none"} key={roomId}>
									<Room roomId={roomId} current={room.current} />
								</div>
							))}
					</MainContainer>
				</ChatContainer>
			</FullScreenContainer>
		);
	}
}

export default connect(mapStateToProps)(Chat);
