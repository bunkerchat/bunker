import React from "react";
import styled from "styled-components";

const Pre = styled.pre`
	white-space: pre-wrap;
`;

const Quote = ({ value }) => (
	<Pre className="p-2 mb-0 border border-dark" dangerouslySetInnerHTML={{ __html: value }} />
);

export default Quote;
