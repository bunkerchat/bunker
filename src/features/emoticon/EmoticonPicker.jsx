import React from "react";
import { connect } from "react-redux";
import { hideEmoticonPicker, searchEmoticonPicker } from "./emoticonPickerActions";
import styled from "styled-components";
import theme from "../../constants/theme";

const Container = styled.div`
	width: 300px;
	height: 250px;
`;

const EmoticonCategory = styled.div`
	display: flex;
	flex-wrap: wrap;
	overflow-y: auto;
	overflow-x: hidden;
`;

const Emoticon = styled.div`
	flex: 0 0 50px;
	height: 30px;

	&.selected {
		background: ${theme.mentionBackgroundColor};
	}
`;

const EmoticonImage = styled.span`
	display: inline-block;
	height: 100%;
	width: 100%;
	background-repeat: no-repeat;
	background-size: contain;
	background-position-x: center;
`;

const mapStateToProps = state => ({
	target: state.emoticonPicker.target,
	filteredEmoticons: state.emoticonPicker.filteredEmoticons,
	searchValue: state.emoticonPicker.search,
	selected: state.emoticonPicker.selected
});

const mapDispatchToProps = dispatch => ({
	hideEmoticonPicker: () => {
		dispatch(hideEmoticonPicker());
	},
	searchEmoticonPicker: text => {
		dispatch(searchEmoticonPicker(text));
	}
});

class EmoticonPicker extends React.Component {
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

	onSubmit = event => {
		console.log("todo: not sure how to get event over to chat input");
	};

	render() {
		const { target, filteredEmoticons, searchValue, selected } = this.props;

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
				<EmoticonCategory>
					{filteredEmoticons.map(emoticon => (
						<Emoticon key={emoticon.name} className={`p-1 ${selected === emoticon.name ? "selected" : ""}`}>
							<EmoticonImage style={{ backgroundImage: `url(/assets/images/emoticons/${emoticon.file})` }} />
						</Emoticon>
					))}
				</EmoticonCategory>
			</Container>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(EmoticonPicker);
