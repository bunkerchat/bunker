import React from "react";
import { connect } from "react-redux";
import { hideEmoticonPicker, searchEmoticonPicker } from "./emoticonPickerActions";
import styled from "styled-components";
import EmoticonCategory from "./EmoticonCategory.jsx";
import EmoticonPickerSearch from "./EmoticonPickerSearch.jsx";

// full screen container that always renders
// hidden state is off screen
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

// full screen backdrop to intercept clicking away from picker
const Backdrop = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
`;

// picker has highest z-index
const Picker = styled.div`
	width: 300px;
	height: 250px;
	z-index: 1001;
`;

const mapStateToProps = state => ({
	visible: state.emoticonPicker.visible,
	x: state.emoticonPicker.x,
	y: state.emoticonPicker.y,
	direction: state.emoticonPicker.direction,
	onPick: state.emoticonPicker.onPick,
	filteredEmoticons: state.emoticonPicker.filteredEmoticons,
	selectedEmoticon: state.emoticonPicker.selected,
	searchValue: state.emoticonPicker.search,
	searchInputVisible: state.emoticonPicker.searchInputVisible
});

const mapDispatchToProps = dispatch => ({
	hideEmoticonPicker: () => {
		dispatch(hideEmoticonPicker());
	},
	searchEmoticonPicker: text => {
		dispatch(searchEmoticonPicker(text));
	}
});

class EmoticonPicker extends React.PureComponent {
	constructor() {
		super();
		this.state = {
			ref: React.createRef()
		};
	}

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

		const style = {
			position: "fixed"
		};

		if (visible) {
			const top = y - this.state.ref.current.offsetHeight;
			if (top > 0) {
				style.top = `${y - this.state.ref.current.offsetHeight}px`;
			} else {
				style.top = `${y}px`;
			}

			if (direction === "left") {
				style.left = `${x - this.state.ref.current.offsetWidth}px`;
			} else {
				style.left = `${x}px`;
			}
		}

		return (
			<Container className={`${!visible ? "hidden" : ""}`}>
				<Backdrop onClick={this.hide} />
				<Picker innerRef={this.state.ref} className="card p-1" style={style}>
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

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(EmoticonPicker);
