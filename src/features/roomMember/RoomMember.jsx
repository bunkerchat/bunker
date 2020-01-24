import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserImage from "../users/UserImage.jsx";
import { appendNick } from "../chatInput/chatInputReducer";
import { getActiveRoomId } from "../room/roomSelectors.js";

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

const mapStateToProps = (state, props) => {
	return {
		roomId: getActiveRoomId(state),
		nick: state.users[props.userId]?.nick,
		email: state.users[props.userId]?.email,
		connected: state.users[props.userId]?.connected,
		present: state.users[props.userId]?.present,
		typingIn: state.users[props.userId]?.typingIn
	};
};

const mapDispatchToProps = {
	appendNick
};

class RoomMember extends React.Component {
	onClickNick = () => {
		this.props.appendNick(this.props.roomId, this.props.nick);
	};

	render() {
		const { roomId, nick, connected, typingIn, userId } = this.props;
		return (
			<Container>
				{connected && typingIn === roomId ? (
					<IconContainer>
						<FontAwesomeIcon icon="ellipsis-h" />
					</IconContainer>
				) : (
					<UserImage userId={userId} />
				)}
				<Nick onClick={this.onClickNick} className="ml-2">
					{nick}
				</Nick>
			</Container>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(RoomMember);
