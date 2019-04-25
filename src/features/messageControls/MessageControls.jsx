import React from "react";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { hideEmoticonPicker, showEmoticonPicker } from "../emoticon/emoticonPickerActions";
import { toggleReaction } from "../message/messageActions";
import { hideMessageControls } from "./messageControlsActions";
import styled from "styled-components";
import { getActiveRoomId, getLocalUser } from "../../selectors/selectors";
import { updateEditedMessage, updateText } from "../input/chatInputReducer";

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

	onClickEdit = () => {
		this.props.updateText(this.props.roomId, this.props.message.text);
		this.props.updateEditedMessage(this.props.roomId, this.props.message);
		this.props.hideMessageControls();
	};

	onClickReaction = event => {
		this.props.showEmoticonPicker(event.clientX, event.clientY, "left", this.onEmoticonPick, this.onEmoticonHide, true);
	};

	onEmoticonPick = emoticonName => {
		this.props.hideEmoticonPicker();
		this.props.hideMessageControls();
		if (emoticonName) {
			this.props.toggleReaction(this.props.message._id, emoticonName);
		}
	};

	onEmoticonHide = () => {
		this.props.hideMessageControls();
	};

	render() {
		const localMessage = this.props.localUser._id === this.props.message.author;
		return (
			<Container className="row no-gutters px-2 bg-light">
				<div className="col text-right">
					{localMessage && (
						<button className="btn btn-link p-0 mr-2" onClick={this.onClickEdit}>
							<FontAwesomeIcon icon={["far", "edit"]}/>
						</button>
					)}
					<button className="btn btn-link p-0" onClick={this.onClickReaction}>
						<FontAwesomeIcon icon={["far", "smile"]}/>
					</button>
				</div>
			</Container>
		);
	}
}

const mapStateToProps = state => ({
	roomId: getActiveRoomId(state),
	localUser: getLocalUser(state)
});

const mapDispatchToProps = {
	showEmoticonPicker,
	hideEmoticonPicker,
	hideMessageControls,
	toggleReaction,
	updateText,
	updateEditedMessage
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MessageControls);
