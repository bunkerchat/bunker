import React from "react";
import styled from "styled-components";
import { toggleMessageImagesVisible } from "./messageActions";
import { connect } from "react-redux";

const Image = styled.div`
	img {
		max-width: 100%;
		max-height: 350px;
	}
`;

const MessageImages = ({ message, toggleMessageImagesVisible }) => {
	const toggleVisible = event => {
		event.stopPropagation();
		toggleMessageImagesVisible(message);
	};

	if (!message.imagesVisible) return null;

	const imageTokens = _.filter(message.tokens, { type: "image" });
	return (
		<div>
			{imageTokens.map((token, index) => (
				<Image key={index}>
					<img src={token.value} alt={token.value} onClick={toggleVisible} />
				</Image>
			))}
			{message.linkMeta &&
				message.linkMeta.image && (
					<Image>
						<h3>{message.linkMeta.title}</h3>
						<img src={message.linkMeta.image} alt={message.linkMeta.title} onClick={toggleVisible} />
					</Image>
				)}
		</div>
	);
};

const mapDispatchToProps = {
	toggleMessageImagesVisible
};

export default connect(
	null,
	mapDispatchToProps
)(MessageImages);
