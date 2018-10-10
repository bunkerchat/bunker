import React from "react";
import { connect } from "react-redux";

const mapStateToProps = (state, props) => ({
	topic: state.rooms[props.roomId].topic
});

class RoomTopic extends React.PureComponent {
	render() {
		const { topic } = this.props;
		return topic ? <div className="p-2">{topic}</div> : null;
	}
}

export default connect(mapStateToProps)(RoomTopic);
