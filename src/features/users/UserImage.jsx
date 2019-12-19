import React, { useMemo } from "react";
import styled from "styled-components";
import Gravatar from "react-gravatar";
import UserStatus from "./UserStatus.jsx";

const Container = styled.div`
	display: flex;
`;

const UserImage = ({ email, connected, present }) => {
	const gravatar = useMemo(() => <Gravatar email={email} size={25} rating="pg" default="identicon" />, []);

	return (
		<Container>
			<UserStatus connected={connected} present={present} />
			{gravatar}
		</Container>
	);
};

export default UserImage;
