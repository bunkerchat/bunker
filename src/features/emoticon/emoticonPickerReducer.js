import emoticons from "../../constants/emoticons";

const handlers = {
	"emoticonPicker/show": (state, action) => ({
		...state,
		target: action.target,
		search: "",
		filteredEmoticons: state.allEmoticons,
		selected: _.first(state.allEmoticons).name
	}),
	"emoticonPicker/hide": state => ({
		...state,
		target: null
	}),
	"emoticonPicker/search": (state, action) => {
		const filteredEmoticons = _.filter(state.allEmoticons, emoticon =>
			new RegExp(action.text, "i").test(emoticon.name)
		);

		if (filteredEmoticons.length > 0) {
			return {
				...state,
				search: action.text,
				filteredEmoticons,
				selected: _.first(filteredEmoticons).name
			};
		} else {
			// Nothing found, close picker
			return {
				...state,
				target: null
			};
		}
	},
	"emoticonPicker/selectLeft": state => {
		let previousIndex = _.findIndex(state.filteredEmoticons, { name: state.selected }) - 1;
		if (previousIndex < 0) {
			previousIndex = 0;
		}
		return {
			...state,
			selected: state.filteredEmoticons[previousIndex].name
		};
	},
	"emoticonPicker/selectRight": state => {
		let nextIndex = _.findIndex(state.filteredEmoticons, { name: state.selected }) + 1;
		if (nextIndex > state.filteredEmoticons.length) {
			nextIndex = state.filteredEmoticons.length;
		}
		return {
			...state,
			selected: state.filteredEmoticons[nextIndex].name
		};
	},
	"emoticonPicker/selectUp": state => {
		let previousIndex = _.findIndex(state.filteredEmoticons, { name: state.selected }) - 5;
		if (previousIndex < 0) {
			previousIndex = 0;
		}
		return {
			...state,
			selected: state.filteredEmoticons[previousIndex].name
		};
	},
	"emoticonPicker/selectDown": state => {
		let nextIndex = _.findIndex(state.filteredEmoticons, { name: state.selected }) + 5;
		if (nextIndex > state.filteredEmoticons.length) {
			nextIndex = state.filteredEmoticons.length;
		}
		return {
			...state,
			selected: state.filteredEmoticons[nextIndex].name
		};
	}
};

const initialState = {
	allEmoticons: emoticons.imageEmoticons,
	filteredEmoticons: [], // make picker load with no gifs rendered on load to reduce lag
	search: ""
};

export default function(state = initialState, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}
