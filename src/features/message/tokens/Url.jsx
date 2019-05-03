import React from "react";
import ToggleButton from "./ToggleButton.jsx";
import { toggleMessageImagesVisible } from "../messageActions";
import {connect} from "react-redux";

const Url = ({ value, message, toggleMessageImagesVisible}) => {
	const toggleImagesVisible = event => {
		event.stopPropagation();
		toggleMessageImagesVisible(message);
	};

	const target = _.includes(value, window.location.origin) ? "_self" : "_blank";
	return (
		<>
			<a href={value} target={target}>
				{value}
			</a>
			{message.linkMeta && message.linkMeta.image && (
				<ToggleButton toggled={message.imagesVisible} onToggle={toggleImagesVisible}/>
			)}
		</>
	);
};

const mapDispatchToProps = {
	toggleMessageImagesVisible
};

export default connect(null, mapDispatchToProps)(Url);
