import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import { toggleMessageImagesVisible } from "../messageActions";
import { connect } from "react-redux";

const ToggleButton = styled.button`
	height: 25px;
	width: 25px;
	padding: 0;
`;

const mapDispatchToProps = {
	toggleMessageImagesVisible
};

class Image extends React.Component {
	toggleVisible = () => {
		this.props.toggleMessageImagesVisible(this.props.message);
	};

	render() {
		const { imagesVisible } = this.props.message;
		const { value } = this.props.token;
		const target = _.includes(value, window.location.origin) ? "_self" : "_blank";
		return (
			<div className="d-inline-block">
				<a href={value} target={target}>
					{value}
				</a>
				<ToggleButton className="btn btn-outline-primary ml-2" onClick={this.toggleVisible}>
					<FontAwesomeIcon icon={imagesVisible ? "caret-down" : "caret-right"} />
				</ToggleButton>
			</div>
		);
	}
}

export default connect(
	false,
	mapDispatchToProps
)(Image);
