import React from "react";
import ToggleButton from "./ToggleButton.jsx";
import { connect } from "react-redux";
import { getImagesVisible, getMessageLinkMetaImage } from "../messageSelectors";
import { toggleMessageImagesVisible } from "../messageSlice";

const Url = ({ messageId, value, linkMetaImage, imagesVisible, toggleMessageImagesVisible }) => {
	const toggleImagesVisible = event => {
		event.stopPropagation();
		toggleMessageImagesVisible({ messageId });
	};

	const target = _.includes(value, window.location.origin) ? "_self" : "_blank";
	return (
		<>
			<a href={value} target={target}>
				{value}
			</a>
			{linkMetaImage && <ToggleButton toggled={imagesVisible} onToggle={toggleImagesVisible} />}
		</>
	);
};

const mapStateToProps = (state, { messageId }) => ({
	imagesVisible: getImagesVisible(messageId)(state),
	linkMetaImage: getMessageLinkMetaImage(messageId)(state)
});

const mapDispatchToProps = {
	toggleMessageImagesVisible
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Url);
