import React from "react";
import styled from "styled-components";
import Gravatar from "react-gravatar";
import UserStatus from "./UserStatus.jsx";
import { getUserConnected, getUserEmail, getUserPresent } from "./usersSelectors.js";
import { connect } from "react-redux";

const Container = styled.div`
	display: flex;
`;

const UserImage = ({ email, connected, present }) => {
	return (
		<Container>
			<UserStatus connected={connected} present={present} />
			<Gravatar email={email} size={25} rating="pg" default="identicon" />
		</Container>
	);
};

const mapStateToProps = (state, { userId }) => ({
	email: getUserEmail(userId)(state),
	connected: getUserConnected(userId)(state),
	present: getUserPresent(userId)(state)
});

export default connect(mapStateToProps)(UserImage);
