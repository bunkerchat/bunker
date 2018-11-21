import React from "react";
import styled from "styled-components";

const Pre = styled.pre`
	white-space: pre-wrap;
`;

const Quote = ({ token }) => (
	<Pre className="p-2 border border-dark" dangerouslySetInnerHTML={{ __html: token.value }} />
);

export default Quote;
