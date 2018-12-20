import React from "react";
import connect from "react-redux/es/connect/connect";
import theme from "../../constants/theme";
import styled from "styled-components";
import RoomMemberListItem from "./RoomMemberListItem.jsx";
import { makeGetRoomMemberUsers } from "../../selectors/selectors";

const MemberListContainer = styled.div`
	flex: 0 0 ${theme.memberList}px;
	height: calc(100vh - ${theme.top}px);
	overflow-x: hidden;
	overflow-y: auto;
`;

const makeMapStateToProps = () => {
	const getRoomMemberUsers = makeGetRoomMemberUsers();
	return (state, props) => {
		return {
			roomMemberUsers: getRoomMemberUsers(state, props)
		};
	};
};

class RoomMemberList extends React.PureComponent {
	render() {
		const { roomId, roomMemberUsers } = this.props;
		const sortedRoomMemberUsers = _.orderBy(
			roomMemberUsers,
			[
				roomMember => roomMember.user.connected,
				roomMember => roomMember.user.present,
				roomMember => roomMember.user.nick.toLowerCase()
			],
			["desc", "desc", "asc"]
		);
		return (
			<MemberListContainer className="border-left d-none d-md-block">
				<ul className="list-group list-group-flush">
					{sortedRoomMemberUsers.map(roomMemberUser => (
						<RoomMemberListItem
							roomId={roomId}
							userId={roomMemberUser.user._id}
							role={roomMemberUser.roomMember.role}
							key={roomMemberUser.roomMember._id}
						/>
					))}
				</ul>
			</MemberListContainer>
		);
	}
}

export default connect(makeMapStateToProps)(RoomMemberList);
