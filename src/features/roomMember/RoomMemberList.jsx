import React from "react";
import { connect } from "react-redux";
import theme from "../../constants/theme";
import styled from "styled-components";
import RoomMemberListItem from "./RoomMemberListItem.jsx";
import { getSortedRoomMemberUsers } from "../../selectors/selectors.js";

const MemberListContainer = styled.div`
	flex: 0 0 ${theme.memberList}px;
	height: calc(100vh - ${theme.top}px);
	overflow-x: hidden;
	overflow-y: auto;
`;

const mapStateToProps = state => ({
	sortedRoomMemberUsers: getSortedRoomMemberUsers(state)
});

class RoomMemberList extends React.Component {
	static defaultProps = {
		sortedRoomMemberUsers: []
	};

	render() {
		return (
			<MemberListContainer className="border-left d-none d-md-block">
				<ul className="list-group list-group-flush">
					{this.props.sortedRoomMemberUsers.map(roomMemberUser => (
						<RoomMemberListItem userId={roomMemberUser.user} role={roomMemberUser.role} key={roomMemberUser._id} />
					))}
				</ul>
			</MemberListContainer>
		);
	}
}

export default connect(mapStateToProps)(RoomMemberList);
