import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ToggleButton = styled.button`
	height: 25px;
	width: 25px;
	padding: 0;
`;

export default ({ toggled, onToggle }) => (
	<ToggleButton className="btn btn-outline-primary ml-2" onClick={onToggle}>
		<FontAwesomeIcon icon={toggled ? "caret-down" : "caret-right"}/>
	</ToggleButton>
);
