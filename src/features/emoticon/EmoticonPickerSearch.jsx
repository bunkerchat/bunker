import React from "react";

export default class EmoticonPickerSearch extends React.PureComponent {
	onSearchChange = event => {
		this.props.searchEmoticonPicker(event.target.value);
	};

	onSearchKeyDown = event => {
		if (event.key === "Enter") {
			event.preventDefault();
			this.props.onPick(this.props.selectedEmoticon);
		}
	};

	render() {
		const { searchValue } = this.props;

		return (
			<div className="form-group-sm pb-1">
				<input
					ref={input => input && input.focus()}
					className="form-control form-control-sm input-sm"
					type="text"
					value={searchValue}
					onChange={this.onSearchChange}
					onKeyDown={this.onSearchKeyDown}
				/>
			</div>
		);
	}
}
