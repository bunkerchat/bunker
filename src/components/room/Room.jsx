import React from "react";
import MessageList from "../message/MessageList.jsx";
import ChatInput from "../input/ChatInput.jsx";
import { loadRoomMessages } from "../../actions/room";
import connect from "react-redux/es/connect/connect";

const mapStateToProps = (state, ownProps) => {
	const room = state.rooms[ownProps.roomId];
	return {
		loading: room.loading,
		messages: room.$messages
	};
};

const mapDispatchToProps = dispatch => ({
	loadMessages: (roomId, skip) => {
		dispatch(loadRoomMessages(roomId, skip));
	}
});

class Room extends React.Component {
	onScroll = _.throttle(() => {
		if (window.scrollY < 100 && !this.props.loading) {
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
		// Room is no longer current room, remove scroll listener
		if (prevProps.current) {
			window.removeEventListener("scroll", this.onScroll);
		}

		if (this.props.current) {
			// If we're adding a messages and scrolled to top, scroll down 1 pixel to prevent
			// browser behavior of sticky scrolling
			if (this.props.messages.length > prevProps.messages.length && window.scrollY === 0) {
				window.scrollTo(0, 1);
			}

			// Room is now current room, add scroll listener
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
