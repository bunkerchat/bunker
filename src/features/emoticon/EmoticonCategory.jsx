import React from "react";
import styled from "styled-components";
import theme from "../../constants/theme";

const Container = styled.div`
	display: flex;
	flex-wrap: wrap;
	overflow-y: auto;
	overflow-x: hidden;
`;

const Emoticon = styled.div`
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
`;

export default class EmoticonCategory extends React.PureComponent {
	render() {
		const { emoticons, selected } = this.props;
		return (
			<Container>
				{emoticons.map(emoticon => (
					<Emoticon key={emoticon.name} className={`p-1 ${selected === emoticon.name ? "selected" : ""}`}>
						<EmoticonImage style={{ backgroundImage: `url(/assets/images/emoticons/${emoticon.file})` }} />
					</Emoticon>
				))}
			</Container>
		);
	}
}
