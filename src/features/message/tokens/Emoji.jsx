import React from "react";
import styled from "styled-components";

const EmojiContainer = styled.span`
	font-size: 1.1em;
`;

const Emoji = ({ token }) => (
	<EmojiContainer>
		<span dangerouslySetInnerHTML={{ __html: token.value }} />
	</EmojiContainer>
);

export default Emoji;
