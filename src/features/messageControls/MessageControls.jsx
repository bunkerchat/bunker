import React from "react";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { hideEmoticonPicker, showEmoticonPicker } from "../emoticon/emoticonPickerActions";
import { toggleReaction } from "../message/messageActions";
import { hideMessageControls } from "./messageControlsActions";
import styled from "styled-components";

const Container = styled.div`
	border-top: solid #eee 1px;
`;

class MessageControls extends React.Component {
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
		return (
			<Container className="row no-gutters px-2 bg-light">
				<div className="col text-right">
					<button className="btn btn-link p-0" onClick={this.onClick}>
						<FontAwesomeIcon icon={["far", "smile"]}/>
					</button>
				</div>
			</Container>
		);
	}
}

const mapStateToProps = state => ({
	messageId: state.messageControls.messageId
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

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MessageControls);
