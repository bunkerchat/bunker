import { loadImage } from "./imageLoader.js";
import { doSingleImageUpload } from "./imageUpload.js";
import { appendText } from "../input/chatInputReducer.js";
import { getActiveRoomId } from "../../selectors/selectors.js";

/* selectors */

export const getImageFileUploads = state => state.imageUpload.files;

/* actions */
const SET_IMAGES_UPLOAD = "imagesUpload/set";

export const setImageFilesToUpload = files => ({ type: SET_IMAGES_UPLOAD, files });

export const uploadImageFiles = () => (dispatch, getState) => {
	const state = getState();
	const files = getImageFileUploads(state);
	const activeRoomId = getActiveRoomId(state);

	return loadImage(files[0])
		.then(loadedData => doSingleImageUpload(loadedData.data.split(",")[1]))
		.then(imageUrl => dispatch(appendText(activeRoomId, imageUrl)))
		.finally(() => dispatch(setImageFilesToUpload([])));
};

/* reducers */
const handlers = {
	[SET_IMAGES_UPLOAD]: (state, action) => ({ files: action.files })
};

const initialState = {
	files: []
};

export default function(state = initialState, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}
