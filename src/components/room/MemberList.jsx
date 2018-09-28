import React from "react";
import connect from "react-redux/es/connect/connect";
import theme from "../../constants/theme";
import styled from "styled-components";
import Gravatar from "react-gravatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const MemberListContainer = styled.div`
	flex: 0 0 ${theme.memberList}px;
	height: calc(100vh - ${theme.top}px);
	overflow-x: hidden;
	overflow-y: auto;
`;

const IconContainer = styled.div`
	display: inline-block;
	width: 25px;
	height: 25px;
	text-align: center;
	vertical-align: middle;
`;

const mapStateToProps = (state, ownProps) => ({
	members: _(state.rooms[ownProps.roomId].$members)
		.map(member => state.users[member.user])
		.remove()
		.value()
});

class MemberList extends React.Component {
	render() {
		const { roomId, members } = this.props;
		const onlineMembers = _.filter(members, { connected: true });
		const offlineMembers = _.filter(members, { connected: false });
		return (
			<MemberListContainer className="border-left d-none d-md-block">
				<ul className="list-group list-group-flush">
					{onlineMembers.map(member => (
						<li className="list-group-item p-2" key={member._id}>
							{member.typingIn === roomId ? (
								<IconContainer>
									<FontAwesomeIcon icon="ellipsis-h" />
								</IconContainer>
							) : (
								<Gravatar email={member.email} size={25} rating="pg" default="monsterid" />
							)}
							<span className="ml-2">{member.nick}</span>
						</li>
					))}
					{offlineMembers.map(member => (
						<li className="list-group-item p-2 disabled" key={member._id}>
							<Gravatar email={member.email} size={25} rating="pg" default="monsterid" /> {member.nick}
						</li>
					))}
				</ul>
			</MemberListContainer>
		);
	}
}

export default connect(mapStateToProps)(MemberList);
