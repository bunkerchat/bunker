import React from "react";
import styled from "styled-components";
import theme from "../../constants/theme";
import { connect } from "react-redux";
import { emoticonPicked } from "./emoticonPickerThunks";
import {
	getIsInSearchFilter,
	getIsSelectedEmoticon,
	getSearchInputVisible,
	getSearchValueEmoticon,
	getSelectedEmoticon
} from "./emoticonPickerSelectors";
import { emoticonNameHash } from "../../constants/emoticons.js";

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

const Emoticon = ({ emoticonName, isSelectedEmoticon, isInSearchFilter, emoticonPicked }) => {
	function onClick() {
		emoticonPicked(emoticonName);
	}

	const file = emoticonNameHash[emoticonName].file;

	return (
		<Container
			className={`p-1 ${isSelectedEmoticon ? "selected" : ""} ${isInSearchFilter ? "" : "d-none"}`}
			onClick={onClick}
		>
			<EmoticonImage style={{ backgroundImage: `url(/assets/images/emoticons/${file})` }} />
		</Container>
	);
};

const mapStateToProps = (state, { emoticonName }) => ({
	isSelectedEmoticon: getIsSelectedEmoticon(emoticonName)(state),
	isInSearchFilter: getIsInSearchFilter(emoticonName)(state)
});

const mapDispatchToProps = {
	emoticonPicked
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Emoticon);
