import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserImage from "../users/UserImage.jsx";
import { appendNick } from "../chatInput/chatInputReducer";
import { getActiveRoomId } from "../room/roomSelectors.js";
import {
	getUserConnected,
	getUserEmail,
	getUserNick,
	getUserPresent,
	getUserTypingIn
} from "../users/usersSelectors.js";

const Container = styled.div`
	display: flex;
`;

const IconContainer = styled.div`
	display: inline-block;
	width: 28px;
	height: 25px;
	text-align: center;
	vertical-align: middle;
`;

const Nick = styled.a`
	line-height: 25px;
	cursor: pointer;
`;

const RoomMember = ({ roomId, nick, connected, typingIn, userId, appendNick }) => {
	function onClickNick() {
		appendNick(roomId, nick);
	}

	return (
		<Container>
			{connected && typingIn === roomId ? (
				<IconContainer>
					<FontAwesomeIcon icon="ellipsis-h" />
				</IconContainer>
			) : (
				<UserImage userId={userId} />
			)}
			<Nick onClick={onClickNick} className="ml-2">
				{nick}
			</Nick>
		</Container>
	);
};

const mapStateToProps = (state, props) => ({
	roomId: getActiveRoomId(state),
	nick: getUserNick(props.userId)(state),
	email: getUserEmail(props.userId)(state),
	connected: getUserConnected(props.userId)(state),
	present: getUserPresent(props.userId)(state),
	typingIn: getUserTypingIn(props.userId)(state)
});

const mapDispatchToProps = {
	appendNick
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(RoomMember);
