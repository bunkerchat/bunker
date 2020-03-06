import React from "react";
import { connect } from "react-redux";
import { MessageTokens } from "../message/MessageTokens.jsx";
import { getRoomTopic } from "./roomSelectors.js";

class RoomTopic extends React.Component {
	render() {
		const { message } = this.props;
		if (!message || !message.tokens) return null;

		return (
			<div className="p-2 border-dark border-top-0 border-bottom border-left-0 border-right-0 d-none d-md-block">
				<MessageTokens className="p-2" messageId={message._id} tokens={message.tokens} />
			</div>
		);
	}
}

const mapStateToProps = state => ({
	message: getRoomTopic(state)
});

export default connect(mapStateToProps)(RoomTopic);
