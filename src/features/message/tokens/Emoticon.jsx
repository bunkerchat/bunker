import React from "react";
import styled from "styled-components";
import emoticons from "../../../constants/emoticons";

const EmoticonImg = styled.img`
	max-height: 24px;
`;

const Emoticon = ({ token }) => {
	const emoticonText = token.value;
	const knownEmoticon = emoticons.emoticonNameHash[emoticonText];
	return <EmoticonImg title="${emoticonText}" src={`/assets/images/emoticons/${knownEmoticon.file}`} />;
};

export default Emoticon;
