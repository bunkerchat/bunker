import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import NickPickerUser from "./NickPickerUser.jsx";

const Container = styled.div`
	display: flex;
	flex-wrap: wrap;
	overflow-y: auto;
	overflow-x: hidden;
`;

const NickPickerUserList = ({ users }) => (
	<Container>
		{users.map(user => (
			<NickPickerUser key={user._id} user={user}/>
		))}
	</Container>
);

const mapStateToProps = state => ({
	users: state.nickPicker.filteredUsers
});

const mapDispatchToProps = {};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(NickPickerUserList);
