import React from "react";
import connect from "react-redux/es/connect/connect";
import theme from "../../constants/theme";
import styled from "styled-components";
import Gravatar from "react-gravatar";

const MemberListContainer = styled.div`
	flex: 0 0 ${theme.memberList}px;
	height: calc(100vh - ${theme.top}px);
	overflow-x: hidden;
	overflow-y: auto;
`;

const mapStateToProps = (state, ownProps) => ({
	members: _(state.rooms[ownProps.roomId].$members)
		.map(member => state.users[member.user])
		.remove()
		.value()
});

class MemberList extends React.Component {
	render() {
		const { members } = this.props;
		return (
			<MemberListContainer className="border-left d-none d-md-block">
				<ul className="list-group list-group-flush">
					{members.map(member => (
						<li className="list-group-item p-2" key={member._id}>
							<Gravatar email={member.email} size={25} rating="pg" default="monsterid" /> {member.nick}
						</li>
					))}
				</ul>
			</MemberListContainer>
		);
	}
}

export default connect(mapStateToProps)(MemberList);
