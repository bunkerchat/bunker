import React from "react";
import { connect } from "react-redux";
import { hideEmoticonPicker } from "./emoticonPickerActions";

const mapStateToProps = state => ({
	target: state.emoticonPicker.target,
	searchValue: state.emoticonPicker.search
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
		const { target } = this.props;

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
			<div ref={this.state.ref} style={style}>
				<div className="card">
					<div className="card-body">
						I'm the emoticon picker
					</div>
				</div>
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(EmoticonPicker);
