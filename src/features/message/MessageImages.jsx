import React from "react";
import styled from "styled-components";

const Image = styled.div`
	img {
		max-width: 100%;
		max-height: 500px;
	}
`;

export default class MessageImages extends React.Component {
	render() {
		const { message } = this.props;
		if (!message.imagesVisible) return null;

		const imageTokens = _.filter(message.tokens, { type: "image" });
		return (
			<div>
				{imageTokens.map((token, index) => (
					<Image onClick={this.toggleVisible} key={index}>
						<img src={token.value} alt={token.value} />
					</Image>
				))}
			</div>
		);
	}
}
