import React from "react";
import { Picker } from "emoji-mart";
import { connect } from "react-redux";
import styled from "styled-components";

const Container = styled.div`
	position: fixed;
`;

const mapStateToProps = state => ({
	target: state.emoticonPicker.target
});

class EmoticonPicker extends React.Component {
	constructor() {
		super();
		this.state = {
			ref: React.createRef()
		};
	}

	render() {
		const { target } = this.props;

		const style = {};
		if (target) {
			style.top = `${target.current.offsetTop - this.state.ref.current.offsetHeight}px`;
			style.left = `${target.current.offsetLeft}px`;
		} else {
			style.left = "-10000px"; // hide off screen
		}

		return (
			<Container innerRef={this.state.ref} style={style}>
				<Picker />
			</Container>
		);
	}
}

export default connect(mapStateToProps)(EmoticonPicker);
