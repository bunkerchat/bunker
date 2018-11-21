import React from "react";

const Pre = styled.pre`
	white-space: pre-wrap;
`;

const Quote = ({ token }) => (
	<Pre className="p-2 bg-light text-dark border border-dark" dangerouslySetInnerHTML={{ __html: token.value }} />
);

export default Quote;
