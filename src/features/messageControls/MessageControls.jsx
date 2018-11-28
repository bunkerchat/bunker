import React from "react";
import styled from "styled-components";
import connect from "react-redux/es/connect/connect";
import theme from "../../constants/theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { hideEmoticonPicker, showEmoticonPicker } from "../emoticon/emoticonPickerActions";
import { toggleReaction } from "../message/messageActions";
import { hideMessageControls } from "./messageControlsActions";

// todo need backdrop hide click

const Container = styled.div`
	position: fixed;
	left: 0;
	background-color: ${theme.messageControlsBackground};
	
	&.hidden {
		left: -10000px;
	}
`;

const mapStateToProps = state => ({
	messageId: state.messageControls.messageId,
	x: state.messageControls.x,
	y: state.messageControls.y
});

const mapDispatchToProps = dispatch => ({
	showEmoticonPicker: (x, y, onEmotionPick) => {
		dispatch(showEmoticonPicker(x, y, "left", onEmotionPick, true));
	},
	hideEmoticonPicker: () => {
		dispatch(hideEmoticonPicker());
	},
	hideMessageControls: () => {
		dispatch(hideMessageControls())
	},
	toggleReaction: (messageId, emoticonName) => {
		dispatch(toggleReaction(messageId, emoticonName));
	}
});

class MessageControls extends React.PureComponent {
	onClick = event => {
		this.props.showEmoticonPicker(event.clientX, event.clientY, this.onEmoticonPick);
	};

	onEmoticonPick = emoticonName => {
		this.props.hideEmoticonPicker();
		this.props.hideMessageControls();
		if (emoticonName) {
			this.props.toggleReaction(this.props.messageId, emoticonName);
		}
	};

	render() {
		const { messageId, x, y } = this.props;
		const visible = !!messageId;

		const style = {
			top: `${y}px`,
		};

		if (visible) {
			style.left = `${x}px`;
		}

		return (
			<Container className={`p-1 border border-dark ${!visible ? "hidden" : ""}`} style={style}>
				<button className="btn btn-link p-0" onClick={this.onClick}>
					<FontAwesomeIcon icon={["far", "smile"]}/>
				</button>
			</Container>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MessageControls);
