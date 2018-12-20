import React from "react";
import styled from "styled-components";
import Emoticon from "./Emoticon.jsx";

const Container = styled.div`
	display: flex;
	flex-wrap: wrap;
	overflow-y: auto;
	overflow-x: hidden;
`;

const NoEmoticonsAlert = styled.div`
	flex: 1;
	text-align: center;
`;

export default class EmoticonCategory extends React.PureComponent {
	render() {
		const { emoticons, selected, onPick } = this.props;
		return (
			<Container>
				{emoticons.length === 0 && <NoEmoticonsAlert>No matching emoticons</NoEmoticonsAlert>}
				{emoticons.map(emoticon => (
					<Emoticon key={emoticon.name} emoticon={emoticon} selected={selected} onPick={onPick} />
				))}
			</Container>
		);
	}
}
