import { createSlice } from "@reduxjs/toolkit";
import { getActiveRoomId } from "../../selectors/selectors";
import { updateText } from "../input/chatInputReducer";

export const imagePickSelectionsReceived = (message, images) => ({
	type: "images/received",
	message,
	images
});
export const closeImageSelections = () => ({ type: "images/close" });
export const selectImage = image => (dispatch, getState) => {
	const state = getState();
	const activeRoomId = getActiveRoomId(state);
	const message = state.imagePick.message;

	dispatch(updateText(activeRoomId, `${message} ${image} `));
	dispatch(closeImageSelections());
};

const imagePickSlice = createSlice({
	name: "imagePick",
	initialState: {},
	reducers: {
		"images/received": (state, action) => ({
			message: action.message,
			images: action.images
		}),
		"images/close": () => ({})
	}
});

// export const {  } = imagePickSlice.actions;

export default imagePickSlice.reducer;

// const testImages = [
// 	"http://chariotlearning.com/wp-content/uploads/2015/12/Testing_in_Progress.gif",
// 	"http://blogs.edweek.org/teachers/work_in_progress/test-clip-art-4i9e5q6iE.gif",
// 	"http://www.sandboxadvisors.com/wp-content/uploads/2013/03/psychometric-and-pre-employment-test-singapore.gif",
// 	"http://chariotlearning.com/wp-content/uploads/2015/12/Testing_in_Progress.gif",
// 	"http://blogs.edweek.org/teachers/work_in_progress/test-clip-art-4i9e5q6iE.gif",
// 	"http://www.sandboxadvisors.com/wp-content/uploads/2013/03/psychometric-and-pre-employment-test-singapore.gif",
// 	"http://chariotlearning.com/wp-content/uploads/2015/12/Testing_in_Progress.gif",
// 	"http://blogs.edweek.org/teachers/work_in_progress/test-clip-art-4i9e5q6iE.gif",
// 	"http://www.sandboxadvisors.com/wp-content/uploads/2013/03/psychometric-and-pre-employment-test-singapore.gif"
// ];
