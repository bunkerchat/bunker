import React from "react";
import { connect } from "react-redux";
import { hideEmoticonPicker, searchEmoticonPicker } from "./emoticonPickerActions";
import styled from "styled-components";
import EmoticonCategory from "./EmoticonCategory.jsx";

const Container = styled.div`
	width: 300px;
	height: 250px;
`;

const mapStateToProps = state => ({
	target: state.emoticonPicker.target,
	onPick: state.emoticonPicker.onPick,
	filteredEmoticons: state.emoticonPicker.filteredEmoticons,
	selectedEmoticon: state.emoticonPicker.selected,
	searchValue: state.emoticonPicker.search
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
			this.props.hideEmoticonPicker();
		}
	};

	onSearchChange = event => {
		this.props.searchEmoticonPicker(event.target.value);
	};

	render() {
		const { target, filteredEmoticons, selectedEmoticon, onPick } = this.props;

		const style = {
			position: "fixed"
		};

		if (target) {
			style.top = `${target.current.offsetTop - this.state.ref.current.offsetHeight}px`;
			style.left = `${target.current.offsetLeft}px`;
		} else {
			style.left = "-10000px"; // hide off screen
		}

		return (
			<Container innerRef={this.state.ref} className="card p-1" style={style}>
				<div className="form-group-sm">
					{/*<input className="form-control" type="text" value={searchValue} onChange={this.onSearchChange} onSubmit={this.onSubmit}/>*/}
				</div>
				<EmoticonCategory emoticons={filteredEmoticons} selected={selectedEmoticon} onPick={onPick} />
			</Container>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(EmoticonPicker);
