import React from "react";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { hideEmoticonPicker, searchEmoticonPicker } from "./emoticonPickerActions";
import styled from "styled-components";
import EmoticonCategory from "./EmoticonCategory.jsx";
import EmoticonPickerSearch from "./EmoticonPickerSearch.jsx";
import Backdrop from "../backdrop/Backdrop.jsx";

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
		if (typeof this.props.onHide === "function") {
			this.props.onHide();
		}
	};

	render() {
		const {
			visible,
			x,
			y,
			direction,
			filteredEmoticons,
			selectedEmoticon,
			searchEmoticonPicker,
			onPick,
			searchValue,
			searchInputVisible
		} = this.props;

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
					{searchInputVisible && (
						<EmoticonPickerSearch
							searchValue={searchValue}
							selectedEmoticon={selectedEmoticon}
							searchEmoticonPicker={searchEmoticonPicker}
							onPick={onPick}
						/>
					)}
					<EmoticonCategory emoticons={filteredEmoticons} selected={selectedEmoticon} onPick={onPick} />
				</Picker>
			</Container>
		);
	}
}

const mapStateToProps = createStructuredSelector({
	visible: state => state.emoticonPicker.visible,
	x: state => state.emoticonPicker.x,
	y: state => state.emoticonPicker.y,
	direction: state => state.emoticonPicker.direction,
	onPick: state => state.emoticonPicker.onPick,
	onHide: state => state.emoticonPicker.onHide,
	filteredEmoticons: state => state.emoticonPicker.filteredEmoticons,
	selectedEmoticon: state => state.emoticonPicker.selected,
	searchValue: state => state.emoticonPicker.search,
	searchInputVisible: state => state.emoticonPicker.searchInputVisible
});

const mapDispatchToProps = {
	hideEmoticonPicker,
	searchEmoticonPicker
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(EmoticonPicker);
