import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { showEmoticonPicker } from "../emoticon/emoticonPickerActions";

const ButtonsContainer = styled.div`
	flex: 1;
`;

const mapDispatchToProps = dispatch => ({
	showEmoticonMenu: target => {
		dispatch(showEmoticonPicker(target));
	}
});

class ChatButtons extends React.PureComponent {
	constructor() {
		super();
		this.state = {
			emoticonButtonRef: React.createRef()
		};
	}

	onShowEmoticonMenu = () => {
		this.props.showEmoticonMenu(this.state.emoticonButtonRef);
	};

	render() {
		return (
			<div className="d-flex">
				<ButtonsContainer>
					<button ref={this.state.emoticonButtonRef} className="btn btn-link" onClick={this.onShowEmoticonMenu}>
						Emoticons
					</button>
				</ButtonsContainer>
				<ButtonsContainer className="text-right">
					<button className="btn btn-link">Upload</button>
				</ButtonsContainer>
			</div>
		);
	}
}

export default connect(
	null,
	mapDispatchToProps
)(ChatButtons);
