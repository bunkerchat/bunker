import React from "react";
import styled from "styled-components";
import MessageReaction from "./MessageReaction.jsx";
import { connect } from "react-redux";
import { getMessageReactions } from "./messageSelectors";

const Container = styled.div`
	display: inline-block;
	background-color: lightblue;
`;

const MessageReactions = ({ reactions }) => {
	if (reactions.length === 0) return null;

	const reactionGroups = _.groupBy(reactions, "emoticonName");
	return (
		<Container className="ml-1">
			{_.map(reactionGroups, (reactionGroup, emoticonName) => (
				<MessageReaction emoticonName={emoticonName} reactions={reactionGroup} key={emoticonName} />
			))}
		</Container>
	);
};

MessageReactions.defaultProps = {
	reactions: []
};

const mapStateToProps = (state, { messageId }) => ({
	reactions: getMessageReactions(messageId)(state)
});

export default connect(mapStateToProps)(MessageReactions);
