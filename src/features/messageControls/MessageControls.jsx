import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import theme from "../../constants/theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { hideEmoticonPicker, showEmoticonPicker } from "../emoticon/emoticonPickerActions";
import { toggleReaction } from "../message/messageActions";
import { hideMessageControls } from "./messageControlsActions";
import Backdrop from "../backdrop/Backdrop.jsx";

const Container = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	z-index: 1000;

	&.hidden {
		left: -10000px;
	}
`;

const Controls = styled.div`
	position: absolute;
	z-index: 1001
	background-color: ${theme.messageControlsBackground};
	border-width: 2px !important;
	border-radius: 5px;
`;

const mapStateToProps = state => ({
	messageId: state.messageControls.messageId,
	x: state.messageControls.x,
	y: state.messageControls.y
});

const mapDispatchToProps = dispatch => ({
	showEmoticonPicker: (x, y, onEmotionPick, onHide) => {
		dispatch(showEmoticonPicker(x, y, "left", onEmotionPick, onHide, true));
	},
	hideEmoticonPicker: () => {
		dispatch(hideEmoticonPicker());
	},
	hideMessageControls: () => {
		dispatch(hideMessageControls());
	},
	toggleReaction: (messageId, emoticonName) => {
		dispatch(toggleReaction(messageId, emoticonName));
	}
});

class MessageControls extends React.PureComponent {
	componentDidMount() {
		document.addEventListener("keydown", this.onKeyDown, false);
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this.onKeyDown, false);
	}

	onKeyDown = event => {
		if (event.keyCode === 27) {
			this.props.hideMessageControls();
		}
	};

	onClick = event => {
		this.props.showEmoticonPicker(event.clientX, event.clientY, this.onEmoticonPick, this.onEmoticonHide);
	};

	onEmoticonPick = emoticonName => {
		this.props.hideEmoticonPicker();
		this.props.hideMessageControls();
		if (emoticonName) {
			this.props.toggleReaction(this.props.messageId, emoticonName);
		}
	};

	onEmoticonHide = () => {
		this.props.hideMessageControls();
	};

	render() {
		const { messageId, x, y } = this.props;
		const visible = !!messageId;

		const style = {
			top: `${y}px`
		};

		if (visible) {
			style.left = `${x}px`;
		}

		return (
			<Container className={!visible ? "hidden" : ""}>
				<Backdrop onClick={this.props.hideMessageControls} />
				<Controls className="p-1 border border-primary" style={style}>
					<button className="btn btn-link p-0" onClick={this.onClick}>
						<FontAwesomeIcon icon={["far", "smile"]} />
					</button>
				</Controls>
			</Container>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MessageControls);
