import React from "react";
import styled from "styled-components";
import connect from "react-redux/es/connect/connect";
import theme from "../../constants/theme";
import { showMessageControls } from "../messageControls/messageControlsActions";

const Container = styled.div`
	position: relative;
	flex: 1;
	min-height: 30px;

	&.mention {
		background-color: ${theme.mentionBackgroundColor};
		color: ${theme.mentionForegroundColor};
	}
`;

const mapStateToProps = (state, props) => ({
	localNick: state.localUser.nick,
	isSelectedMessage: state.messageControls.messageId === props.messageId
});

const mapDispatchToProps = {
	showMessageControls
};

class MessageBodyContainer extends React.Component {
	onClick = event => {
		this.props.showMessageControls(this.props.messageId, event.clientX - 10, event.clientY - 10);
	};

	render() {
		const { text, firstInSeries, localNick, isSelectedMessage } = this.props;
		const isUserMentioned = testTextForNick(text, localNick);

		let border = "";
		if (isSelectedMessage) {
			border = "border border-primary";
		} else if (firstInSeries) {
			border = "border-top border-light";
		}

		return (
			<Container className={`px-2 ${border} ${isUserMentioned ? "mention" : ""}`} onClick={this.onClick}>
				{this.props.children}
			</Container>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MessageBodyContainer);

function testTextForNick(text, nick) {
	const mentionRegex = new RegExp(`${nick}\\b|@[Aa]ll\\b`, "i");
	return mentionRegex.test(text);
}
