import React from "react";
import { toggleMessageImagesVisible } from "../messageActions";
import { connect } from "react-redux";
import ToggleButton from "./ToggleButton.jsx";

const Image = ({ value, message, toggleMessageImagesVisible }) => {
	const toggleVisible = event => {
		event.stopPropagation();
		toggleMessageImagesVisible(message);
	};

	const target = _.includes(value, window.location.origin) ? "_self" : "_blank";
	return (
		<div className="d-inline-block">
			<a href={value} target={target}>
				{value}
			</a>
			<ToggleButton toggled={message.imagesVisible} onToggle={toggleVisible}/>
		</div>
	);
};

const mapDispatchToProps = {
	toggleMessageImagesVisible
};

export default connect(
	null,
	mapDispatchToProps
)(Image);
