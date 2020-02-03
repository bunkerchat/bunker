import React from "react";
import { connect } from "react-redux";
import { hideEmoticonPicker } from "./emoticonPickerActions";
import styled from "styled-components";
import EmoticonCategory from "./EmoticonCategory.jsx";
import EmoticonPickerSearch from "./EmoticonPickerSearch.jsx";
import Backdrop from "../backdrop/Backdrop.jsx";
import { getSearchInputVisible } from "./emoticonPickerSelectors";
import { hideMessageControls } from "../messageControls/messageControlsSlice";

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
	width: 300px;
	height: 250px;
	z-index: 1006;
`;

class EmoticonPicker extends React.Component {
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
		this.props.hideEmoticonPicker();
		this.props.hideMessageControls();
	};

	render() {
		const { visible, x, y, direction, searchInputVisible } = this.props;

		const style = {};

		if (visible) {
			const top = y - this.ref.current.offsetHeight;
			if (top > 0) {
				style.top = `${y - this.ref.current.offsetHeight}px`;
			} else {
				style.top = `${y}px`;
			}

			if (direction === "left") {
				style.left = `${x - this.ref.current.offsetWidth}px`;
			} else {
				style.left = `${x}px`;
			}
		}

		return (
			<Container className={`${!visible ? "hidden" : ""}`}>
				<Backdrop onClick={this.hide} />
				<Picker ref={this.ref} className="card p-1" style={style}>
					{searchInputVisible && <EmoticonPickerSearch />}
					<EmoticonCategory />
				</Picker>
			</Container>
		);
	}
}

const mapStateToProps = state => ({
	visible: state.emoticonPicker.visible,
	x: state.emoticonPicker.x,
	y: state.emoticonPicker.y,
	direction: state.emoticonPicker.direction,
	onHide: state.emoticonPicker.onHide,
	searchInputVisible: getSearchInputVisible(state)
});

const mapDispatchToProps = {
	hideEmoticonPicker,
	hideMessageControls
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(EmoticonPicker);
