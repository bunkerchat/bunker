import React from "react";
import Room from "../room/Room.jsx";
import Lobby from "../lobby/Lobby.jsx";
import Settings from "../settings/Settings.jsx";
import Header from "../header/Header.jsx";
import { connect } from "react-redux";
import styled from "styled-components";
import { changeActiveRoom, changePresent } from "../users/localUserActions";
import { hasAnyUnreadMention, getActiveRoom, getTotalUnreadMessageCount } from "../../selectors/selectors";

const Container = styled.div`
	display: flex;
	flex-direction: column;
	width: 100vw;
	height: 100vh;
`;

const mapStateToProps = (state, ownProps) => {
	const sectionMatch = /2\/(\w+)/.exec(ownProps.location.pathname);
	return {
		loaded: state.localUser.loaded,
		section: sectionMatch ? sectionMatch[1] : null,
		rooms: state.rooms,
		activeRoom: getActiveRoom(state),
		totalUnreadMessageCount: getTotalUnreadMessageCount(state),
		anyUnreadMention: hasAnyUnreadMention(state)
	};
};

const mapDispatchToProps = dispatch => ({
	changeActiveRoom: roomId => {
		dispatch(changeActiveRoom(roomId));
	},
	changePresent: present => {
		dispatch(changePresent(present));
	}
});

class Chat extends React.PureComponent {
	componentDidMount() {
		window.document.addEventListener("visibilitychange", () => {
			this.props.changePresent(document.visibilityState === "visible");
		});
	}

	componentDidUpdate(prevProps) {
		const previousActiveRoom = prevProps.activeRoom || { _id: "prevlobby" };
		const activeRoom = this.props.activeRoom || { _id: "currlobby" };
		if (previousActiveRoom._id !== activeRoom._id) {
			this.props.changeActiveRoom(activeRoom._id || null);
		}

		const unread =
			this.props.totalUnreadMessageCount > 0
				? `${this.props.anyUnreadMention ? "*" : ""}(${this.props.totalUnreadMessageCount}) `
				: "";

		// Set title
		switch (this.props.section) {
			case "settings":
				document.title = `${unread}Settings - Bunker`;
				break;
			case "room":
				document.title = `${unread}${activeRoom.name} - Bunker`;
				break;
			default:
				document.title = `${unread}Bunker`;
				break;
		}
	}

	render() {
		const { loaded, section, rooms } = this.props;

		if (!loaded) {
			return <div>Loading...</div>;
		}

		return (
			<Container>
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
			</Container>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Chat);
