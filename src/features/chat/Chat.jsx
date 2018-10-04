import React from "react";
import Room from "../room/Room.jsx";
import Lobby from "../lobby/Lobby.jsx";
import Settings from "../settings/Settings.jsx";
import Header from "../header/Header.jsx";
import { connect } from "react-redux";
import styled from "styled-components";
import { changeActiveRoom } from "../users/localUserActions";

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
		rooms: state.rooms
	};
};

const mapDispatchToProps = dispatch => ({
	changeActiveRoom: roomId => {
		dispatch(changeActiveRoom(roomId));
	}
});

class Chat extends React.PureComponent {
	componentDidUpdate() {
		const activeRoom = _.find(this.props.rooms, { current: true });
		this.props.changeActiveRoom(activeRoom ? activeRoom._id : null);
	}

	render() {
		const { loaded, section, rooms } = this.props;

		if (!loaded) {
			return <div>Loading...</div>;
		}

		return (
			<Container>
				<Header />
				{section === "settings" && <Settings />}
				{section === "lobby" && <Lobby />}
				{section === "room" &&
					_.map(rooms, (room, roomId) => <Room roomId={roomId} current={room.current} key={roomId} />)}
			</Container>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Chat);
