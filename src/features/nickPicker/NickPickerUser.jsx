import React from "react";
import styled from "styled-components";
import theme from "../../constants/theme";
import { connect } from "react-redux";
import { getIsInSearchFilter, getIsSelectedUser } from "./nickPickerSelectors";
import { nickPicked } from "./nickPickerThunks";
import UserImage from "../users/UserImage.jsx";

const Container = styled.div`
	flex: 0;
	height: 30px;

	&.selected {
		background: ${theme.mentionBackgroundColor};
	}
`;

const Nick = styled.div`
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	line-height: 25px;
`;

const NickPickerUser = ({ user, isSelected, isInSearchFilter, nickPicked }) => {
	function onClick() {
		nickPicked(user);
	}

	return (
		<Container
			className={`p-1 ${isSelected ? "selected" : ""} ${isInSearchFilter ? "" : "d-none"}`}
			onClick={onClick}
		>
			<div className="d-flex">
				<UserImage userId={user._id} />
				<Nick className="d-none d-md-inline-block ml-2">{user.nick}</Nick>
			</div>
		</Container>
	);
};

const mapStateToProps = (state, { user }) => ({
	isSelected: getIsSelectedUser(user)(state),
	isInSearchFilter: getIsInSearchFilter(user)(state)
});

const mapDispatchToProps = {
	nickPicked
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(NickPickerUser);
