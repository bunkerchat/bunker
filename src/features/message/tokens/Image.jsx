import React from "react";
import { connect } from "react-redux";
import ToggleButton from "./ToggleButton.jsx";
import { getImagesVisible } from "../messageSelectors";
import { toggleMessageImagesVisible } from "../messageSlice";

const Image = ({ messageId, value, imagesVisible, toggleMessageImagesVisible }) => {
	const toggleVisible = event => {
		event.stopPropagation();
		toggleMessageImagesVisible({messageId});
	};

	const target = _.includes(value, window.location.origin) ? "_self" : "_blank";
	return (
		<div className="d-inline-block">
			<a href={value} target={target}>
				{value}
			</a>
			<ToggleButton toggled={imagesVisible} onToggle={toggleVisible} />
		</div>
	);
};

const mapStateToProps = (state, { messageId }) => ({
	imagesVisible: getImagesVisible(messageId)(state)
});

const mapDispatchToProps = {
	toggleMessageImagesVisible
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Image);
