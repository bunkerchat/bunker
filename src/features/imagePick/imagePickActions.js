import { sendRoomMessage } from "../room/roomActions";
import { getActiveRoomId } from "../../selectors/selectors";

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
	return dispatch(sendRoomMessage(activeRoomId, `${message} ${image}`))
		.then(() => {
			dispatch(closeImageSelections());
		});
};

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
