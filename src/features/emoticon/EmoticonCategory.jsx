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

const EmoticonCategory = ({ filteredEmoticons }) => {
	return (
		<Container>
			{filteredEmoticons.length === 0 && <NoEmoticonsAlert>No matching emoticons</NoEmoticonsAlert>}
			{filteredEmoticons.map(emoticon => (
				<Emoticon key={emoticon.name} emoticon={emoticon} />
			))}
		</Container>
	);
};

const mapStateToProps = state => ({
	filteredEmoticons: state.emoticonPicker.filteredEmoticons,
});

const mapDispatchToProps = {};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(EmoticonCategory);
