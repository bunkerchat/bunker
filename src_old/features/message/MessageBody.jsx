import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import MessageTimeAgo from "./MessageTimeAgo.jsx";
import MessageReactions from "./MessageReactions.jsx";
import MessageTokens from "./MessageTokens.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MessageImages from "./MessageImages.jsx";
import MessageBodyContainer from "./MessageBodyContainer.jsx";
import { getNickForMessage } from "../shared/sharedSelectors";
import { getMessageCreatedAt, getMessageEdited } from "./messageSelectors";

const MessageTime = styled.div`
	width: 120px;
`;

const MessageBody = ({ messageId, edited, firstInSeries, nick, createdAt }) => {
	return (
		<MessageBodyContainer messageId={messageId} firstInSeries={firstInSeries}>
			{firstInSeries && (
				<div className="row d-md-none">
					<div className="col">
						<h6>{nick || "Unknown"}</h6>
					</div>
					<div className="col text-right">
						<small className="text-muted">
							<MessageTimeAgo date={createdAt} />
						</small>
					</div>
				</div>
			)}
			<div className="row no-gutters px-2">
				<div className="col">
					<MessageTokens messageId={messageId} />
					<MessageReactions messageId={messageId} />
					<MessageImages messageId={messageId} />
				</div>
				{firstInSeries && (
					<MessageTime className="d-none d-md-block text-right">
						<small className="text-muted">
							<MessageTimeAgo date={createdAt} />
						</small>
					</MessageTime>
				)}
				{edited && <FontAwesomeIcon icon={["far", "edit"]} className="ml-2 my-1 text-muted" />}
			</div>
		</MessageBodyContainer>
	);
};

const mapStateToProps = (state, { messageId }) => ({
	nick: getNickForMessage(messageId)(state),
	createdAt: getMessageCreatedAt(messageId)(state),
	edited: getMessageEdited(messageId)(state),
	isSelectedMessage: state.messageControls.messageId === messageId
});

export default connect(mapStateToProps)(MessageBody);
