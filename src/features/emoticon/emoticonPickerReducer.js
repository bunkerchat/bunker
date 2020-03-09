import { imageEmoticonsNames } from "../../constants/emoticons";

const handlers = {
	"emoticonPicker/show": (state, action) => ({
		...state,
		visible: true,
		x: action.x,
		y: action.y,
		direction: action.direction,
		search: "",
		filteredEmoticons: imageEmoticonsNames,
		selected: imageEmoticonsNames[0],
		searchInputVisible: action.searchInputVisible
	}),
	"emoticonPicker/hide": state => ({
		...state,
		visible: false
	}),
	"emoticonPicker/search": (state, action) => {
		const search = action.text.toLowerCase();
		const filteredEmoticons = imageEmoticonsNames.filter(name => name.toLowerCase().includes(search));

		return {
			...state,
			search,
			filteredEmoticons,
			selected: filteredEmoticons[0]
		};
	},
	"emoticonPicker/selectLeft": state => {
		const { filteredEmoticons, selected } = state;
		let previousIndex = filteredEmoticons.indexOf(selected) - 1;
		if (previousIndex < 0) {
			previousIndex = filteredEmoticons.length - 1;
		}

		return { ...state, selected: filteredEmoticons[previousIndex] };
	},
	"emoticonPicker/selectRight": state => {
		const { filteredEmoticons, selected } = state;

		let nextIndex = filteredEmoticons.indexOf(selected) + 1;
		if (nextIndex === filteredEmoticons.length) {
			nextIndex = 0;
		}

		return { ...state, selected: filteredEmoticons[nextIndex] };
	},
	"emoticonPicker/selectUp": state => {
		const { filteredEmoticons, selected } = state;

		let previousIndex = filteredEmoticons.indexOf(selected) - 5;
		if (previousIndex < 0) {
			previousIndex = 0;
		}
		return { ...state, selected: filteredEmoticons[previousIndex] };
	},
	"emoticonPicker/selectDown": state => {
		const { filteredEmoticons, selected } = state;

		let nextIndex = filteredEmoticons.indexOf(selected) + 5;

		if (nextIndex > filteredEmoticons.length) {
			nextIndex = filteredEmoticons.length;
		}
		return { ...state, selected: filteredEmoticons[nextIndex] };
	}
};

const initialState = {
	filteredEmoticons: [], // make picker load with no gifs rendered on load to reduce lag
	search: ""
};

export default function(state = initialState, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}
