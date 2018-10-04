import React from "react";
import styled from "styled-components";
import MessageText from "./MessageText.jsx";
import connect from "react-redux/es/connect/connect";
import theme from "../../constants/theme";
import MessageTimeAgo from "./MessageTimeAgo.jsx";

const MessageBodyContainer = styled.div`
	flex: 1;
	&.mention {
		background-color: ${theme.mentionBackgroundColor};
		${theme.mentionForegroundColor ? `color: ${theme.mentionForegroundColor}` : ""};
	}
`;

const MessageTime = styled.div`
	width: 100px;
`;

const mapStateToProps = (state, ownProps) => ({
	nick: state.users[ownProps.message.author].nick,
	localNick: state.localUser.nick
});

class MessageBody extends React.Component {
	shouldComponentUpdate(nextProps) {
		// Only reason we're updating is if text changes
		return this.props.message.text !== nextProps.message.text;
	}

	render() {
		const { message, firstInSeries, nick, localNick } = this.props;
		const isUserMentioned = testTextForNick(message.text, localNick);

		return (
			<MessageBodyContainer
				className={`px-2 pb-1 ${firstInSeries ? "border-light border-top" : ""} ${isUserMentioned ? "mention" : ""}`}
			>
				{firstInSeries && (
					<div className="row d-md-none">
						<div className="col">
							<h6>{nick}</h6>
						</div>
						<div className="col text-right">
							<small>
								<MessageTimeAgo date={message.createdAt} />
							</small>
						</div>
					</div>
				)}

				<div className="row no-gutters">
					<div className="col">
						<MessageText text={message.text} />
					</div>
					{firstInSeries && (
						<MessageTime className="d-none d-md-block text-right">
							<small>
								<MessageTimeAgo date={message.createdAt} />
							</small>
						</MessageTime>
					)}
				</div>
			</MessageBodyContainer>
		);
	}
}

export default connect(mapStateToProps)(MessageBody);

function testTextForNick(text, nick) {
	const mentionRegex = new RegExp(`${nick}\\b|@[Aa]ll\\b`, "i");
	return mentionRegex.test(text);
}
