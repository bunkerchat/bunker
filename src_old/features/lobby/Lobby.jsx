import React, { useEffect, useRef } from "react";
import { connect, useSelector } from "react-redux";
import styled from "styled-components";
import LobbyRoomLink from "./LobbyRoomLink.jsx";
import { getActiveRoomId, getReadRoomIds, getUnreadRoomIds } from "../room/roomSelectors.js";
import { useTitle } from "react-use";

const Container = styled.div`
	flex: 1;
	overflow: auto;
`;

function Lobby({ unreadRoomIds, readRoomIds }) {
	useTitle("Lobby - Bunker");

	const ref = useRef(null);

	const activeRoomId = useSelector(getActiveRoomId);

	useEffect(() => {
		ref.current.scrollTop = 0;
	}, []);

	return (
		<Container ref={ref} className={`container-fluid mt-3 ${activeRoomId ? "d-none" : ""}`}>
			<ul className="list-group mb-3">
				{unreadRoomIds.map(roomId => (
					<LobbyRoomLink key={roomId} roomId={roomId} />
				))}
			</ul>
			<ul className="list-group mb-3">
				{readRoomIds.map(roomId => (
					<LobbyRoomLink key={roomId} roomId={roomId} />
				))}
			</ul>
		</Container>
	);
}

const mapStateToProps = state => ({
	unreadRoomIds: getUnreadRoomIds(state),
	readRoomIds: getReadRoomIds(state)
});

export default connect(mapStateToProps)(Lobby);
