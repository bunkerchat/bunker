import React, { useEffect } from "react";
import Room from "../room/Room.jsx";
import Lobby from "../lobby/Lobby.jsx";
import Settings from "../settings/Settings.jsx";
import Header from "../header/Header.jsx";
import { connect } from "react-redux";
import styled from "styled-components";
import { changeActiveRoom, changePresent } from "../users/localUserActions";
import EmoticonPicker from "../emoticon/EmoticonPicker.jsx";
import MessageControls from "../messageControls/MessageControls.jsx";
import { getActiveRoomId, getDocumentTitle, getSection } from "../../selectors/selectors.js";

function DocumentTitle(props) {
	useEffect(
		() => {
			document.title = props.title;
		},
		[props.title]
	);

	return null;
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	width: 100vw;
	height: 100vh;
`;

const mapStateToProps = state => ({
	loaded: state.localUser.loaded,
	section: getSection(state),
	rooms: state.rooms,
	activeRoomId: getActiveRoomId(state),
	title: getDocumentTitle(state)
});

const mapDispatchToProps = {
	changeActiveRoom,
	changePresent
};

class Chat extends React.PureComponent {
	setActiveRoom() {
		const { changeActiveRoom, activeRoomId } = this.props;
		changeActiveRoom(activeRoomId);
	}

	componentDidMount() {
		this.setActiveRoom();
		window.document.addEventListener("visibilitychange", () => {
			this.props.changePresent(document.visibilityState === "visible");
		});
	}

	componentDidUpdate(prevProps) {
		if (prevProps.activeRoomId !== this.props.activeRoomId) {
			this.setActiveRoom();
		}
	}

	render() {
		const { loaded, section, rooms, title } = this.props;

		if (!loaded) {
			return <div>Loading...</div>;
		}

		return (
			<Container>
				<DocumentTitle title={title} />
				<Header />
				<div className={`${section === "lobby" ? "d-block" : "d-none"}`}>
					<Lobby />
				</div>
				<div className={`${section === "settings" ? "d-block" : "d-none"}`}>
					<Settings />
				</div>
				{_.map(rooms, (room, roomId) => (
					<Room roomId={roomId} current={room.current} key={roomId} />
				))}

				<EmoticonPicker />
				<MessageControls />
			</Container>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Chat);
