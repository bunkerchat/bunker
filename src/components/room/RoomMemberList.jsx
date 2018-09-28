import React from "react";
import connect from "react-redux/es/connect/connect";
import theme from "../../constants/theme";
import styled from "styled-components";
import RoomMember from "./RoomMember.jsx";

const MemberListContainer = styled.div`
	flex: 0 0 ${theme.memberList}px;
	height: calc(100vh - ${theme.top}px);
	overflow-x: hidden;
	overflow-y: auto;
`;

const RoomMemberListItem = ({ roomId, user }) => (
	<li className="list-group-item p-2">
		<RoomMember roomId={roomId} user={user} />
	</li>
);

const mapStateToProps = (state, ownProps) => ({
	roomMemberUsers: _(state.rooms[ownProps.roomId].$members)
		.map(member => state.users[member.user])
		.remove()
		.value()
});

class RoomMemberList extends React.Component {
	render() {
		const { roomId, roomMemberUsers } = this.props;
		const onlineUsers = _.filter(roomMemberUsers, { connected: true });
		const offlineUsers = _.filter(roomMemberUsers, { connected: false });
		return (
			<MemberListContainer className="border-left d-none d-md-block">
				<ul className="list-group list-group-flush">
					{onlineUsers.map(user => (
						<RoomMemberListItem roomId={roomId} user={user} key={user._id} />
					))}
					{offlineUsers.map(user => (
						<RoomMemberListItem roomId={roomId} user={user} key={user._id} />
					))}
				</ul>
			</MemberListContainer>
		);
	}
}

export default connect(mapStateToProps)(RoomMemberList);
