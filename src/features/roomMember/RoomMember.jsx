import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserImage from "../users/UserImage.jsx";
import { getActiveRoomId } from "../../selectors/selectors.js";

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

const Nick = styled.div`
	line-height: 25px;
`;

const mapStateToProps = (state, props) => {
	return {
		roomId: getActiveRoomId(state),
		nick: (state.users[props.userId] || {}).nick,
		email: (state.users[props.userId] || {}).email,
		connected: (state.users[props.userId] || {}).connected,
		present: (state.users[props.userId] || {}).present,
		typingIn: (state.users[props.userId] || {}).typingIn
	};
};

class RoomMember extends React.Component {
	render() {
		const { roomId, nick, email, connected, present, typingIn } = this.props;
		return (
			<Container>
				{connected && typingIn === roomId ? (
					<IconContainer>
						<FontAwesomeIcon icon="ellipsis-h" />
					</IconContainer>
				) : (
					<UserImage email={email} connected={connected} present={present} />
				)}
				<Nick className="ml-2">{nick}</Nick>
			</Container>
		);
	}
}

export default connect(mapStateToProps)(RoomMember);
