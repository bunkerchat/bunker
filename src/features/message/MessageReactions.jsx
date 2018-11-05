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
		const reactions = message.reactions || [];

		if (reactions.length === 0) return null;

		const reactionGroups = _.groupBy(reactions, "emoticonName");
		return (
			<Container className="ml-1">
				{_.map(reactionGroups, (reactionGroup, emoticonName) => {
					const emoticon = _.find(emoticons.imageEmoticons, { name: emoticonName });
					return (
						<Emoticon key={emoticonName} className="px-1">
							<img src={`/assets/images/emoticons/${emoticon.file}`} />
							<span>{reactionGroup.length > 1 ? reactionGroup.length : ""}</span>
						</Emoticon>
					);
				})}
			</Container>
		);
	}
}
