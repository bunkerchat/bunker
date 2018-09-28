import React from "react";
import styled from "styled-components";
import MessageText from "./MessageText.jsx";
import connect from "react-redux/es/connect/connect";
import theme from "../../constants/theme";

const MessageBodyContainer = styled.div`
	flex: 1;
	&.mention {
		background-color: ${theme.mentionBackgroundColor};
		${theme.mentionForegroundColor ? "color:" + theme.mentionForegroundColor : ""};
	}
`;

const mapStateToProps = (state, ownProps) => ({
	nick: state.users[ownProps.message.author].nick,
	localNick: state.user.nick
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
				{firstInSeries && <h6 className="d-md-none">{nick}</h6>}
				<MessageText text={message.text} />
			</MessageBodyContainer>
		);
	}
}

export default connect(mapStateToProps)(MessageBody);

function testTextForNick(text, nick) {
	const mentionRegex = new RegExp(nick + "\\b|@[Aa]ll\\b", "i");
	return mentionRegex.test(text);
}
