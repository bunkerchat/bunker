import React from "react";
import styled from "styled-components";
import Gravatar from "react-gravatar";
import UserStatus from "./UserStatus.jsx";

const Container = styled.div`
	display: flex;
`;

export default class UserImage extends React.PureComponent {
	render() {
		const { email, connected, present } = this.props;
		return (
			<Container>
				<UserStatus connected={connected} present={present} />
				<Gravatar email={email} size={25} rating="pg" default="identicon" />
			</Container>
		);
	}
}
