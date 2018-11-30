import React from "react";
import styled from "styled-components";
import { toggleMessageImagesVisible } from "./messageActions";
import { connect } from "react-redux";

const Image = styled.div`
	img {
		max-width: 100%;
		max-height: 500px;
	}
`;

const mapDispatchToProps = {
	toggleMessageImagesVisible
};

class MessageImages extends React.Component {
	toggleVisible = event => {
		event.stopPropagation();
		this.props.toggleMessageImagesVisible(this.props.message);
	};

	render() {
		const { message } = this.props;
		if (!message.imagesVisible) return null;

		const imageTokens = _.filter(message.tokens, { type: "image" });
		return (
			<div>
				{imageTokens.map((token, index) => (
					<Image key={index}>
						<img src={token.value} alt={token.value} onClick={this.toggleVisible} />
					</Image>
				))}
			</div>
		);
	}
}

export default connect(
	false,
	mapDispatchToProps
)(MessageImages);
