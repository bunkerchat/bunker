import React from "react";
import styled from "styled-components";
import MessageReaction from "./MessageReaction.jsx";

const Container = styled.div`
	display: inline-block;
	background-color: lightblue;
`;

export default class MessageReactions extends React.PureComponent {
	render() {
		const { message } = this.props;
		const reactions = message.reactions || [];

		if (reactions.length === 0) return null;

		const reactionGroups = _.groupBy(reactions, "emoticonName");
		return (
			<Container className="ml-1">
				{_.map(reactionGroups, (reactionGroup, emoticonName) => (
					<MessageReaction emoticonName={emoticonName} reactions={reactionGroup} key={emoticonName} />
				))}
			</Container>
		);
	}
}
