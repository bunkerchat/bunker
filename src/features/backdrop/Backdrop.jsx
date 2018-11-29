import React from "react";
import styled from "styled-components";

const FullScreen = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
`;

const Backdrop = ({ onClick }) => <FullScreen onClick={onClick} />;

export default Backdrop;
