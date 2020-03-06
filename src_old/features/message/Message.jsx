import React from "react";
import MessageAuthor from "./MessageAuthor.jsx";
import MessageBody from "./MessageBody.jsx";
import { connect } from "react-redux";
import { getFirstInSeries, getMessageAuthorId } from "./messageSelectors";

const Message = ({ messageId, authorId, firstInSeries }) => {
	return (
		<div className={`d-flex ${firstInSeries ? "mt-3 mt-md-0" : ""}`}>
			<MessageAuthor authorId={authorId} firstInSeries={firstInSeries} />
			<MessageBody messageId={messageId} firstInSeries={firstInSeries} />
		</div>
	);
};

const mapStateToProps = (state, { messageId, previousMessageId }) => ({
	authorId: getMessageAuthorId(messageId)(state),
	firstInSeries: getFirstInSeries(messageId, previousMessageId)(state)
});

export default connect(mapStateToProps)(Message);
