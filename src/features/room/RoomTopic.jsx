import React from "react";
import { connect } from "react-redux";
import MessageTokens from "../message/MessageTokens.jsx";

const mapStateToProps = (state, props) => {
	const room = state.rooms[props.roomId];
	return {
		topic: room.topic,
		topicTokens: room.topicTokens || []
	};
};

class RoomTopic extends React.Component {
	render() {
		const { topic, topicTokens } = this.props;
		return topicTokens && topicTokens.length > 0 ? (
			<div className="p-2 border-dark border-top-0 border-bottom border-left-0 border-right-0 d-none d-md-block">
				<MessageTokens className="p-2" message={{ tokens: topicTokens, text: topic }} />
			</div>
		) : null;
	}
}

export default connect(mapStateToProps)(RoomTopic);
