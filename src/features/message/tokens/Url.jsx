import React from "react";

const Url = ({ token }) => {
	const { value } = token;
	const target = _.includes(value, window.location.origin) ? "_self" : "_blank";
	return (
		<a href={value} target={target}>
			{value}
		</a>
	);
};

export default Url;
