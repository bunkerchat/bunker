import React from "react";
import connect from "react-redux/es/connect/connect";
import theme from "../../constants/theme";
import styled from "styled-components";
import RoomMemberListItem from "./RoomMemberListItem.jsx";

const MemberListContainer = styled.div`
	flex: 0 0 ${theme.memberList}px;
	height: calc(100vh - ${theme.top}px);
	overflow-x: hidden;
	overflow-y: auto;
`;

const mapStateToProps = (state, ownProps) => ({
	roomMemberUsers: _(state.rooms[ownProps.roomId].$members)
		.map(roomMember => {
			const user = state.users[roomMember.user];
			return user ? { roomMember, user } : null;
		})
		.remove()
		.value()
});

class RoomMemberList extends React.PureComponent {
	render() {
		const { roomId, roomMemberUsers } = this.props;
		const online = _.filter(roomMemberUsers, roomMemberUser => roomMemberUser.user.connected);
		const offline = _.filter(roomMemberUsers, roomMemberUser => !roomMemberUser.user.connected);
		return (
			<MemberListContainer className="border-left d-none d-md-block">
				<ul className="list-group list-group-flush">
					{online.map(roomMemberUser => (
						<RoomMemberListItem
							roomId={roomId}
							roomMember={roomMemberUser.roomMember}
							user={roomMemberUser.user}
							key={roomMemberUser.roomMember._id}
						/>
					))}
					{offline.map(roomMemberUser => (
						<RoomMemberListItem
							roomId={roomId}
							roomMember={roomMemberUser.roomMember}
							user={roomMemberUser.user}
							key={roomMemberUser.roomMember._id}
						/>
					))}
				</ul>
			</MemberListContainer>
		);
	}
}

export default connect(mapStateToProps)(RoomMemberList);
