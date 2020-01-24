import React from "react";
import styled from "styled-components";
import userId from "../../constants/userId";
import { maxMessages } from "../../constants/chat";
import { connect } from "react-redux";
import MessageList from "./MessageList.jsx";
import theme from "../../constants/theme";
import { isIOS } from "../../constants/browserInfo.js";
import { clearRoomMessages, loadRoomMessages } from "../room/roomsSlice";

const MessageListContainer = styled.div`
	flex: 1;
	flex-grow: 1;
	overflow-y: scroll;
	overflow-x: hidden;

	// todo this hack makes the scrolling box honor our overflow: scroll, not sure why this is needed and I'm sad it's here
	height: calc(100vh - ${theme.inputBox}px);

	// these enable touch scrolling on iOS / Android
	-webkit-overflow-scrolling: touch;
	z-index: 0;
`;

class ScrollingMessageList extends React.PureComponent {
	constructor(props) {
		super(props);
		this.ref = React.createRef();
	}

	onLoadMessages = () => {
		this.props.loadMessages(this.props.roomId, this.props.messages.length);
	};

	onScroll = _.throttle(() => {
		const isSmallScreen = window.outerWidth < 768;
		if (this.ref.current.scrollTop < 100 && !isSmallScreen && !this.props.loading) {
			this.onLoadMessages();
		}
	}, 500);

	componentDidMount() {
		// Scroll to bottom on load
		this.ref.current.scrollTop = this.ref.current.scrollHeight;

		if (this.props.current) {
			// Mobile scroll to bottom on load
			window.scrollTo(0, document.body.offsetHeight);

			this.ref.current.addEventListener("scroll", this.onScroll);
		}
	}

	componentWillUnmount() {
		this.ref.current.removeEventListener("scroll", this.onScroll);
	}

	getSnapshotBeforeUpdate() {
		const currentRef = this.ref.current;
		return {
			wasAtBottom: currentRef.scrollTop + currentRef.offsetHeight >= currentRef.scrollHeight - 10,
			previousElementHeight: currentRef.scrollHeight
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (!prevProps.current && this.props.current) {
			// Room is now current room, restore scroll listener
			this.ref.current.addEventListener("scroll", this.onScroll);
		} else if (!this.props.current) {
			// Room is no longer current room, remove scroll listener
			this.ref.current.removeEventListener("scroll", this.onScroll);
		}

		// If we're adding a lot of messages, use prevDocumentHeight to keep scroll at previous top message
		// This would be triggered when user is loading old messages
		if (this.props.messages.length - prevProps.messages.length > 1) {
			// todo magic number "75" here, makes the scrolling hit the right place, could be improved
			this.ref.current.scrollTop = this.ref.current.scrollHeight - snapshot.previousElementHeight + 75;
		}
		// Else check if we've added a single message and we're at the bottom (autoscrolling)
		// This would be triggered when a new message has been received
		else {
			const wasPreviouslyAtBottom = snapshot.wasAtBottom;
			const lastMessage = _.last(this.props.messages) || {};
			const previousLastMessage = _.last(prevProps.messages) || {};
			const lastMessageIsNewAndLocal =
				lastMessage._id !== previousLastMessage._id && (lastMessage.author && lastMessage.author === userId);

			// Scroll if new message from local user or if the message list is already scrolled to bottom
			if (lastMessageIsNewAndLocal || wasPreviouslyAtBottom) {
				this.ref.current.scrollTop = this.ref.current.scrollHeight;

				// Also, if we're at the bottom, continually prune messages
				if (this.props.messages.length > maxMessages) {
					this.props.clearMessages(this.props.roomId);
				}
			}
		}
	}

	render() {
		const { messages, loading, fullHistoryLoaded, current } = this.props;
		return (
			<MessageListContainer ref={this.ref} className={`${current ? "" : "d-none"}`}>
				{loading ? (
					<div className="alert alert-info text-center mb-0 rounded-0">
						<strong>Loading...</strong>
					</div>
				) : fullHistoryLoaded ? (
					<div className="alert alert-info text-center mb-0 rounded-0">
						<strong>No more messages</strong>
					</div>
				) : (
					<div className="alert alert-info text-center mb-0 rounded-0" onClick={this.onLoadMessages}>
						<a className="alert-link">Load more messages</a>
					</div>
				)}
				<MessageList messages={messages} />
			</MessageListContainer>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	const room = state.rooms[ownProps.roomId];
	return {
		loading: room.loading,
		fullHistoryLoaded: room.fullHistoryLoaded,
		messages: state.messages.byRoom[ownProps.roomId]
	};
};

const mapDispatchToProps = {
	loadMessages: loadRoomMessages,
	clearMessages: clearRoomMessages
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ScrollingMessageList);
