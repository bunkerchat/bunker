import React from "react";
import { connect } from "react-redux";
import MessageText from "../message/MessageText.jsx";

const mapStateToProps = (state, props) => ({
	topic: state.rooms[props.roomId].topic
});

class RoomTopic extends React.PureComponent {
	render() {
		const { topic } = this.props;
		return topic ? (
			<div className="p-2">
				<MessageText className="p-2" text={topic} />
			</div>
		) : null;
	}
}

export default connect(mapStateToProps)(RoomTopic);
