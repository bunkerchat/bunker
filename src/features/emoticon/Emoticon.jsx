import React from "react";
import styled from "styled-components";
import theme from "../../constants/theme";

const Container = styled.div`
	flex: 0 0 50px;
	height: 30px;

	&.selected {
		background: ${theme.mentionBackgroundColor};
	}
`;

const EmoticonImage = styled.span`
	display: inline-block;
	height: 100%;
	width: 100%;
	background-repeat: no-repeat;
	background-size: contain;
	background-position-x: center;
	cursor: pointer;
`;

export default class Emoticon extends React.PureComponent {
	onClick = () => {
		if (_.isFunction(this.props.onPick)) {
			this.props.onPick(this.props.emoticon.name);
		}
	};

	render() {
		const { emoticon, selected } = this.props;
		return (
			<Container className={`p-1 ${selected === emoticon.name ? "selected" : ""}`} onClick={this.onClick}>
				<EmoticonImage style={{ backgroundImage: `url(/assets/images/emoticons/${emoticon.file})` }} />
			</Container>
		);
	}
}
