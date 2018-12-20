import React from "react";
import styled from "styled-components";
import emoticons from "../../../constants/emoticons";
import Word from "./Word.jsx";

const EmoticonImg = styled.img`
	max-height: 24px;
`;

const Emoticon = ({ token }) => {
	const emoticonText = token.value;
	const knownEmoticon = emoticons.emoticonNameHash[emoticonText];

	if (!knownEmoticon) {
		console.warn(`unknown emoticon "${emoticonText}" (supposed to be handled server side) :\`(`);

		// hack?
		token.value = `:${token.value}:`;
		return <Word token={token} />;
	}

	return knownEmoticon.isIcon ? (
		<i className={`fa ${knownEmoticon.file} fa-lg`} title={`:${knownEmoticon.name}:`} />
	) : (
		<EmoticonImg title={`:${emoticonText}:`} src={`/assets/images/emoticons/${knownEmoticon.file}`} />
	);
};

export default Emoticon;
