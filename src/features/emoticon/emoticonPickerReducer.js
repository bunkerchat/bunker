import emoticons from "../../constants/emoticons";

const handlers = {
	"emoticonPicker/show": (state, action) => ({
		...state,
		target: action.target,
		search: "",
		selected: _.first(emoticons.imageEmoticons).name
	}),
	"emoticonPicker/hide": state => ({
		...state,
		target: null,
		search: "",
		selected: null
	}),
	"emoticonPicker/search": (state, action) => ({
		...state,
		search: action.text
	}),
	"emoticonPicker/selectLeft": state => {
		let previousIndex = _.findIndex(emoticons.imageEmoticons, { name: state.selected }) - 1;
		if (previousIndex < 0) {
			previousIndex = 0;
		}
		return {
			...state,
			selected: emoticons.imageEmoticons[previousIndex].name
		};
	},
	"emoticonPicker/selectRight": state => {
		let nextIndex = _.findIndex(emoticons.imageEmoticons, { name: state.selected }) + 1;
		if (nextIndex > emoticons.imageEmoticons.length) {
			nextIndex = emoticons.imageEmoticons.length;
		}
		return {
			...state,
			selected: emoticons.imageEmoticons[nextIndex].name
		};
	}
};

const initialState = {
	search: ""
};

export default function(state = initialState, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}
