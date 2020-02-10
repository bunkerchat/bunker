import React from "react";
import styled from "styled-components";
import { emoticonNameHash } from "../../../constants/emoticons";
import Word from "./Word.jsx";

const EmoticonImg = styled.img`
	max-height: 24px;
`;

const Emoticon = ({ value }) => {
	const knownEmoticon = emoticonNameHash[value];

	if (!knownEmoticon) {
		console.warn(`unknown emoticon "${value}" (supposed to be handled server side) :\`(`);

		// hack?
		const stringValue = `:${value}:`;
		return <Word value={stringValue} />;
	}

	return knownEmoticon.isIcon ? (
		<i className={`fa ${knownEmoticon.file} fa-lg`} title={`:${knownEmoticon.name}:`} />
	) : (
		<EmoticonImg title={`:${value}:`} src={`/assets/images/emoticons/${knownEmoticon.file}`} />
	);
};

export default Emoticon;
