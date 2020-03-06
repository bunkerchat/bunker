import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { selectImage } from "./imagePickActions";

const FixedHeightImage = styled.img`
	height: 150px;
	cursor: pointer;
`;

const Image = ({ image, selectImage }) => {
	const onSelectImage = () => {
		selectImage(image);
	};

	return <FixedHeightImage className="p-2" src={image} onClick={onSelectImage} />;
};

const mapDispatchToProps = {
	selectImage
};

export default connect(
	null,
	mapDispatchToProps
)(Image);
