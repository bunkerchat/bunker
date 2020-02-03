import React from "react";
import styled from "styled-components";
import theme from "../../constants/theme";
import { connect } from "react-redux";
import { emoticonPicked } from "./emoticonPickerThunks";
import { getSearchInputVisible, getSelectedEmoticon } from "./emoticonPickerSelectors";
import emoticons from "../../constants/emoticons.js";

const Container = styled.div`
	flex: 0 0 50px;
	height: 30px;

	&.selected {
		background: ${theme.mentionBackgroundColor};
	}
`;

const EmoticonImage = styled.span`
	display: inline-block;
	height: 100%;
	width: 100%;
	background-repeat: no-repeat;
	background-size: contain;
	background-position-x: center;
	cursor: pointer;
`;

const Emoticon = ({ emoticonName, selectedEmoticon, emoticonPicked }) => {
	function onClick() {
		emoticonPicked(emoticonName);
	}

	const file = emoticons.emoticonNameHash[emoticonName].file;

	return (
		<Container className={`p-1 ${selectedEmoticon === emoticonName ? "selected" : ""}`} onClick={onClick}>
			<EmoticonImage style={{ backgroundImage: `url(/assets/images/emoticons/${file})` }} />
		</Container>
	);
};

const mapStateToProps = state => ({
	selectedEmoticon: getSelectedEmoticon(state),

	// todo: switch this to be something like "message emoticon open" or something
	searchInputVisible: getSearchInputVisible(state)
});

const mapDispatchToProps = {
	emoticonPicked
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Emoticon);
