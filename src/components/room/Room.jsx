import React from "react";
import MessageList from "../message/MessageList.jsx";
import ChatInput from "../input/ChatInput.jsx";
import { loadRoomMessages } from "../../actions/room";
import connect from "react-redux/es/connect/connect";

const mapStateToProps = (state, ownProps) => ({
	messages: state.rooms[ownProps.roomId].$messages
});

const mapDispatchToProps = dispatch => ({
	loadMessages: (roomId, skip) => {
		dispatch(loadRoomMessages(roomId, skip));
	}
});

class Room extends React.Component {
	onScroll = _.throttle(() => {
		if (window.scrollY < 50) {
			this.props.loadMessages(this.props.roomId, this.props.messages.length);
		}
	}, 500);

	componentDidMount() {
		if (this.props.current) {
			window.addEventListener("scroll", this.onScroll);
		}
	}

	componentWillUnmount() {
		window.removeEventListener("scroll", this.onScroll);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.current) {
			window.removeEventListener("scroll", this.onScroll);
		}
		if (this.props.current) {
			window.addEventListener("scroll", this.onScroll);
		}
	}

	render() {
		const { roomId, messages } = this.props;
		return (
			<div>
				<MessageList roomId={roomId} messages={messages} />
				<ChatInput roomId={roomId} />
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Room);
