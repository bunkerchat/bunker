import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import {
	getImagesVisible,
	getMessageById,
	getMessageLinkMetaImage,
	getMessageLinkMetaTitle,
	getMessageTokens
} from "./messageSelectors";
import { toggleMessageImagesVisible } from "./messageSlice";
import { isMobile } from "../../constants/browserInfo";
import { getBunkerServesImages } from "../settings/userSettingsSelectors";

const Image = styled.div`
	img {
		max-width: 100%;
		max-height: 350px;
	}
`;

const mobileParam = isMobile ? "?small=true" : "";

const MessageImages = ({
	messageId,
	tokens,
	imagesVisible,
	linkMetaImage,
	linkMetaTitle,
	toggleMessageImagesVisible,
	bunkerServesImages
}) => {
	const toggleVisible = event => {
		event.stopPropagation();
		toggleMessageImagesVisible({ messageId });
	};

	if (!imagesVisible) return null;

	const imageTokens = _.filter(tokens, { type: "image" });
	const wrapImageForBunkerToServe = isMobile || bunkerServesImages;

	return (
		<div>
			{imageTokens.map((token, index) => {
				const url = wrapImageForBunkerToServe
					? `/api/image/${encodeURIComponent(token.value)}${mobileParam}`
					: token.value;

				return (
					<Image key={index}>
						<img src={url} alt={token.value} onClick={toggleVisible} />
					</Image>
				);
			})}
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
	linkMetaTitle: getMessageLinkMetaTitle(messageId)(state),
	bunkerServesImages: getBunkerServesImages(state)
});

const mapDispatchToProps = {
	toggleMessageImagesVisible
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MessageImages);
