import React from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import { getUserTheme } from "./userSettingsSelectors.js";

const Theme = () => {
	const theme = useSelector(getUserTheme);
	return (
		<Helmet>
			<link rel="stylesheet" href={`/assets/bundled/${theme || "classic"}.css`} />
		</Helmet>
	);
};

export default Theme;
