import React from "react";
import { connect } from "react-redux";
import MessageTokens from "../message/MessageTokens.jsx";

const mapStateToProps = (state, props) => ({
	tokens: state.rooms[props.roomId].topicTokens || []
});

class RoomTopic extends React.Component {
	render() {
		const { tokens } = this.props;
		return tokens && tokens.length > 0 ? (
			<div className="p-2 border-dark border-top-0 border-bottom border-left-0 border-right-0 d-none d-md-block">
				<MessageTokens className="p-2" message={{ tokens }} />
			</div>
		) : null;
	}
}

export default connect(mapStateToProps)(RoomTopic);
