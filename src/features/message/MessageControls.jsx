import React from "react";
import styled from "styled-components";
import connect from "react-redux/es/connect/connect";
import theme from "../../constants/theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { hideEmoticonPicker, showEmoticonPicker } from "../emoticon/emoticonPickerActions";
import { toggleReaction } from "./messageActions";

const Container = styled.div`
	background-color: ${theme.messageControlsBackground};
`;

const mapDispatchToProps = dispatch => ({
	showEmoticonPicker: (x, y, onEmotionPick) => {
		dispatch(showEmoticonPicker(x, y, "left", onEmotionPick, true));
	},
	hideEmoticonPicker: () => {
		dispatch(hideEmoticonPicker());
	},
	toggleReaction: (messageId, emoticonName) => {
		dispatch(toggleReaction(messageId, emoticonName));
	}
});

class MessageControls extends React.Component {
	shouldComponentUpdate() {
		return false;
	}

	onClick = event => {
		this.props.showEmoticonPicker(event.clientX, event.clientY, this.onEmoticonPick);
	};

	onEmoticonPick = emoticonName => {
		this.props.hideEmoticonPicker();
		if (emoticonName) {
			this.props.toggleReaction(this.props.messageId, emoticonName);
		}
	};

	render() {
		return (
			<Container className="px-3 border-dark border border-right-0">
				<button className="btn btn-link p-0" onClick={this.onClick}>
					<FontAwesomeIcon icon={["far", "smile"]} />
				</button>
			</Container>
		);
	}
}

export default connect(
	null,
	mapDispatchToProps
)(MessageControls);
