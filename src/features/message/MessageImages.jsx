import React from "react";
import styled from "styled-components";
import { toggleMessageImagesVisible } from "./messageActions";
import { connect } from "react-redux";
import {
	getImagesVisible,
	getMessageById,
	getMessageLinkMetaImage,
	getMessageLinkMetaTitle,
	getMessageTokens
} from "./messageSelectors";

const Image = styled.div`
	img {
		max-width: 100%;
		max-height: 350px;
	}
`;

const MessageImages = ({ tokens, imagesVisible, linkMetaImage, linkMetaTitle, toggleMessageImagesVisible }) => {
	const toggleVisible = event => {
		event.stopPropagation();
		toggleMessageImagesVisible(message);
	};

	if (!imagesVisible) return null;

	// todo: move to selector?
	const imageTokens = _.filter(tokens, { type: "image" });
	return (
		<div>
			{imageTokens.map((token, index) => (
				<Image key={index}>
					<img src={token.value} alt={token.value} onClick={toggleVisible} />
				</Image>
			))}
			{linkMetaImage && (
				<Image>
					<h3>{linkMetaTitle}</h3>
					<img src={linkMetaImage} alt={linkMetaTitle} onClick={toggleVisible} />
				</Image>
			)}
		</div>
	);
};

const mapStateToProps = (state, { messageId }) => ({
	// TODO: kill this message prop after toggleMessageImagesVisible doesn't need whole message object
	message: getMessageById(messageId)(state),
	tokens: getMessageTokens(messageId)(state),
	imagesVisible: getImagesVisible(messageId)(state),
	linkMetaImage: getMessageLinkMetaImage(messageId)(state),
	linkMetaTitle: getMessageLinkMetaTitle(messageId)(state)
});

const mapDispatchToProps = {
	toggleMessageImagesVisible
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MessageImages);
