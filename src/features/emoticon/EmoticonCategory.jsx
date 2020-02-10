import React from "react";
import styled from "styled-components";
import Emoticon from "./Emoticon.jsx";
import { connect } from "react-redux";
import { imageEmoticons } from "../../constants/emoticons";

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

const EmoticonCategory = ({}) => {
	return (
		<Container>
			{imageEmoticons.map(emoticon => (
				<Emoticon key={emoticon.name} emoticonName={emoticon.name} />
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
