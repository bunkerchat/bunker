import React from "react";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import MessageTokens from "../message/MessageTokens.jsx";
import { makeGetRoomTopic } from "../../selectors/selectors.js";

const mapStateToProps = createStructuredSelector({
	message: makeGetRoomTopic
});

class RoomTopic extends React.Component {
	render() {
		const { message } = this.props;
		if (!message || !message.tokens) return null;

		return (
			<div className="p-2 border-dark border-top-0 border-bottom border-left-0 border-right-0 d-none d-md-block">
				<MessageTokens className="p-2" message={message} />
			</div>
		);
	}
}

export default connect(mapStateToProps)(RoomTopic);
