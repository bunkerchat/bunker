import React from "react";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import styled from "styled-components";
import LobbyRoomLink from "./LobbyRoomLink.jsx";
import { getReadRoomIds, getUnreadRoomIds } from "../../selectors/selectors.js";

const Container = styled.div`
	flex: 1;
	overflow: auto;
`;

function Lobby({unreadRoomIds,readRoomIds}){
	return (
		<Container className="container-fluid mt-3">
			<ul className="list-group mb-3">
				{unreadRoomIds.map(roomId => <LobbyRoomLink key={roomId} roomId={roomId}/>)}
			</ul>
			<ul className="list-group mb-3">
				{readRoomIds.map(roomId => <LobbyRoomLink key={roomId} roomId={roomId}/>)}
			</ul>
		</Container>
		)
}

const mapStateToProps = createStructuredSelector({
	unreadRoomIds: getUnreadRoomIds,
	readRoomIds: getReadRoomIds,
});

export default connect(mapStateToProps)(Lobby);
