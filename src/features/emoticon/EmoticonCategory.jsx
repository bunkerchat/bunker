import React from "react";
import styled from "styled-components";
import Emoticon from "./Emoticon.jsx";
import { connect } from "react-redux";

const Container = styled.div`
	display: flex;
	flex-wrap: wrap;
	overflow-y: auto;
	overflow-x: hidden;
`;

const NoEmoticonsAlert = styled.div`
	flex: 1;
	text-align: center;
`;

const EmoticonCategory = ({ emoticons, selected }) => {
	return (
		<Container>
			{emoticons.length === 0 && <NoEmoticonsAlert>No matching emoticons</NoEmoticonsAlert>}
			{emoticons.map(emoticon => (
				<Emoticon key={emoticon.name} emoticon={emoticon} selected={selected} />
			))}
		</Container>
	);
};

const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(EmoticonCategory);
