import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import {
	getImagesVisible,
	getImageUrls,
	getMessageById,
	getMessageLinkMetaImage,
	getMessageLinkMetaTitle,
	getMessageTokens
} from "./messageSelectors";
import { toggleMessageImagesVisible } from "./messageSlice";

const Image = styled.div`
	img {
		max-width: 100%;
		max-height: 350px;
	}
`;

const MessageImages = ({
	messageId,
	imageUrls,
	imagesVisible,
	linkMetaImage,
	linkMetaTitle,
	toggleMessageImagesVisible
}) => {
	const toggleVisible = event => {
		event.stopPropagation();
		toggleMessageImagesVisible({ messageId });
	};

	if (!imagesVisible) return null;

	return (
		<div>
			{imageUrls.map((url, index) => (
				<Image key={index}>
					<img src={url} alt={url} onClick={toggleVisible} />
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
	imageUrls: getImageUrls(messageId)(state),
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
