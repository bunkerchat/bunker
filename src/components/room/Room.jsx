import React from "react";
import MessageList from "../message/MessageList.jsx";
import ChatInput from "../input/ChatInput.jsx";
import { loadRoomMessages } from "../../actions/room";
import connect from "react-redux/es/connect/connect";
import theme from "../../constants/theme";

const mapStateToProps = (state, ownProps) => {
	const room = state.rooms[ownProps.roomId];
	return {
		loading: room.loading,
		fullHistoryLoaded: room.fullHistoryLoaded,
		messages: room.$messages
	};
};

const mapDispatchToProps = dispatch => ({
	loadMessages: (roomId, skip) => {
		dispatch(loadRoomMessages(roomId, skip));
	}
});

class Room extends React.Component {
	onLoadMessages = () => {
		this.props.loadMessages(this.props.roomId, this.props.messages.length);
	};

	onScroll = _.throttle(() => {
		const isSmallScreen = window.outerWidth < 768;
		if (window.scrollY < 100 && !isSmallScreen && !this.props.loading) {
			this.onLoadMessages();
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

	getSnapshotBeforeUpdate() {
		// Measure document height before update
		return document.body.offsetHeight;
	}

	componentDidUpdate(prevProps, prevState, prevDocumentHeight) {
		if (this.props.current) {
			// If we're adding a lot of messages, use prevDocumentHeight to keep scroll at previous top message
			if (this.props.messages.length - prevProps.messages.length > 1) {
				const addedHeight = document.body.offsetHeight - prevDocumentHeight;
				window.scrollTo(0, addedHeight + theme.top + 35);
			}

			// Room is now current room, add scroll listener
			window.addEventListener("scroll", this.onScroll);
		} else {
			// Room is no longer current room, remove scroll listener
			window.removeEventListener("scroll", this.onScroll);
		}
	}

	render() {
		const { roomId, fullHistoryLoaded, messages } = this.props;
		return (
			<div>
				<div className="alert alert-info text-center mb-0">
					{fullHistoryLoaded ? (
						<span>No more messages</span>
					) : (
						<a className="alert-link" onClick={this.onLoadMessages}>
							Load more messages
						</a>
					)}
				</div>
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
