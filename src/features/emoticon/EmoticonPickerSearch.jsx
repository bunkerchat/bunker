import React from "react";
import { connect } from "react-redux";
import { getSearchValueEmoticon, getSelectedEmoticon } from "./emoticonPickerSelectors";
import { emoticonPicked } from "./emoticonPickerThunks";
import { searchEmoticonPicker } from "./emoticonPickerActions";

const EmoticonPickerSearch = ({ searchEmoticonPicker, searchValue, selectedEmoticon, emoticonPicked }) => {
	function onSearchChange(event) {
		searchEmoticonPicker(event.target.value);
	}

	function onSearchKeyDown(event) {
		if (event.key === "Enter") {
			event.preventDefault();
			emoticonPicked(selectedEmoticon);
		}
	}

	return (
		<div className="form-group-sm pb-1">
			<input
				ref={input => input && input.focus()}
				className="form-control form-control-sm input-sm"
				type="text"
				value={searchValue}
				onChange={onSearchChange}
				onKeyDown={onSearchKeyDown}
			/>
		</div>
	);
};

const mapStateToProps = state => ({
	searchValue: getSearchValueEmoticon(state),
	selectedEmoticon: getSelectedEmoticon(state)
});

const mapDispatchToProps = {
	emoticonPicked,
	searchEmoticonPicker
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(EmoticonPickerSearch);
