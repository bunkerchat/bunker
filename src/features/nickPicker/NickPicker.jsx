import React from "react";
import { connect } from "react-redux";
import { hideNickPicker } from "./nickPickerSlice";
import styled from "styled-components";
import Backdrop from "../backdrop/Backdrop.jsx";
import NickPickerUserList from "./NickPickerUserList.jsx";

// full screen container that always renders
// hidden state is off screen
const Container = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	z-index: 1005;

	&.hidden {
		left: -10000px;
	}
`;

// picker has highest z-index
const Picker = styled.div`
	position: absolute;
	bottom: 40px;
	width: 300px;
	height: 250px;
	z-index: 1006;
`;

class NickPicker extends React.Component {
	ref = React.createRef();

	componentDidMount() {
		document.addEventListener("keydown", this.onKeyDown, false);
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this.onKeyDown, false);
	}

	onKeyDown = event => {
		if (event.keyCode === 27) {
			this.hide();
		}
	};

	hide = () => {
		this.props.hideNickPicker();
	};

	render() {
		const { visible } = this.props;
		return (
			<Container className={`${!visible ? "hidden" : ""}`}>
				<Backdrop onClick={this.hide}/>
				<Picker ref={this.ref} className="card p-1">
					<NickPickerUserList/>
				</Picker>
			</Container>
		);
	}
}

const mapStateToProps = state => ({
	visible: state.nickPicker.visible
});

const mapDispatchToProps = {
	hideNickPicker
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(NickPicker);
