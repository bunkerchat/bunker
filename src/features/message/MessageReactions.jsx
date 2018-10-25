import React from "react";
import styled from "styled-components";
import emoticons from "../../constants/emoticons";

const Container = styled.div`
	display: inline-block;
	background-color: lightblue;
`;

const Emoticon = styled.span`
	img {
		max-height: 24px;
	}
`;

export default class MessageReactions extends React.PureComponent {
	render() {
		const { message } = this.props;
		const reactions = message.reactions;

		if (reactions.length === 0) return null;

		return (
			<Container className="ml-1">
				{reactions.map(reaction => {
					const emoticon = _.find(emoticons.imageEmoticons, { name: reaction.emoticonName });
					return (
						<Emoticon key={reaction._id}>
							<img src={`/assets/images/emoticons/${emoticon.file}`}/>
						</Emoticon>
					);
				})}
			</Container>
		);
	}
}
