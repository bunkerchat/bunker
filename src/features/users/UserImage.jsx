import React from "react";
import styled from "styled-components";
import Gravatar from "react-gravatar";
import UserStatus from "./UserStatus.jsx";

const Container = styled.div`
	display: flex;
`;

export default class UserImage extends React.Component {
	shouldComponentUpdate() {
		return false;
	}

	render() {
		const { user } = this.props;
		return (
			<Container>
				<UserStatus user={user} />
				<Gravatar email={user.email} size={25} rating="pg" default="identicon" />
			</Container>
		);
	}
}
