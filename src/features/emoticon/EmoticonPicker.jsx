import React from "react";
import { connect } from "react-redux";
import { hideEmoticonPicker } from "./emoticonPickerActions";
import emoticon from "../../constants/emoticons";
import styled from "styled-components";
import theme from "../../constants/theme";

const EmoticonCategory = styled.div`
	width: 300px;
	height: 250px;
	display: flex;
	flex-wrap: wrap;
	overflow-y: auto;
	overflow-x: hidden;
`;

const Emoticon = styled.div`
	flex: 1 0 10%;

	&.selected {
		background: ${theme.mentionBackgroundColor};
	}

	img {
		max-height: 24px;
	}
`;

const mapStateToProps = state => ({
	target: state.emoticonPicker.target,
	searchValue: state.emoticonPicker.search,
	selected: state.emoticonPicker.selected
});

const mapDispatchToProps = dispatch => ({
	hideEmoticonPicker: () => {
		dispatch(hideEmoticonPicker());
	}
});

class EmoticonPicker extends React.Component {
	constructor() {
		super();
		this.state = {
			ref: React.createRef()
		};
	}

	onKeyDown = event => {
		if (event.keyCode === 27) {
			this.props.hideEmoticonPicker();
		}
	};

	componentDidMount() {
		document.addEventListener("keydown", this.onKeyDown, false);
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this.onKeyDown, false);
	}

	render() {
		const { target, searchValue, selected } = this.props;

		const style = {
			position: "fixed"
		};

		if (target) {
			style.top = `${target.current.offsetTop - this.state.ref.current.offsetHeight}px`;
			style.left = `${target.current.offsetLeft}px`;
		} else {
			style.left = "-10000px"; // hide off screen
		}

		const imageEmoticons = _.filter(emoticon.imageEmoticons, emoticon =>
			new RegExp(searchValue, "i").test(emoticon.name)
		);

		return (
			<div ref={this.state.ref} className="card p-1" style={style}>
				<div className="form-group-sm">
					<input className="form-control" type="text" value={searchValue} />
				</div>
				<EmoticonCategory>
					{imageEmoticons.map(emoticon => (
						<Emoticon key={emoticon.name} className={`p-1 ${selected === emoticon.name ? "selected" : ""}`}>
							<img src={`/assets/images/emoticons/${emoticon.file}`} />
						</Emoticon>
					))}
				</EmoticonCategory>
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(EmoticonPicker);
