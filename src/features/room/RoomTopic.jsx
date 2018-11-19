import React from "react";
import { connect } from "react-redux";
import MessageTokens from "../message/MessageTokens.jsx";
import { makeGetRoomTopic } from "../../selectors/selectors.js";

const mapStateToProps = state => ({
	message: makeGetRoomTopic(state)
});

class RoomTopic extends React.Component {
	render() {
		const { message } = this.props;
		return message.tokens && message.tokens ? (
			<div className="p-2 border-dark border-top-0 border-bottom border-left-0 border-right-0 d-none d-md-block">
				<MessageTokens className="p-2" message={message} />
			</div>
		) : null;
	}
}

export default connect(mapStateToProps)(RoomTopic);
