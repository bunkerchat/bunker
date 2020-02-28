import React, { useEffect, useCallback } from "react";
import Room from "../room/Room.jsx";
import { useDispatch, useSelector } from "react-redux";
import { changeActiveRoom, changePresent } from "../users/localUserActions";
import EmoticonPicker from "../emoticon/EmoticonPicker.jsx";
import NickPicker from "../nickPicker/NickPicker.jsx";
import ImagePickModal from "../imagePick/ImagePickModal.jsx";
import ImageUploadModal from "../imageUpload/ImageUploadModal.jsx";
import { getActiveRoomId } from "../room/roomSelectors.js";
import { useParams } from "react-router";
import { getImagePickImages } from "../imagePick/imagePickSelectors";
import { useUnmount } from "react-use";

const Chat = () => {
	const { roomId } = useParams();
	const dispatch = useDispatch();
	const activeRoomId = useSelector(getActiveRoomId);
	const imagePickImages = useSelector(getImagePickImages);

	const visibilityChanged = useCallback(() => {
		dispatch(changePresent(document.visibilityState === "visible"));
	}, []);

	useEffect(() => {
		window.document.addEventListener("visibilitychange", visibilityChanged);
		return () => {
			window.document.removeEventListener("visibilitychange", visibilityChanged);
		};
	}, []);

	useEffect(() => {
		if (activeRoomId === roomId) return;
		dispatch(changeActiveRoom(roomId));
	}, [activeRoomId, roomId]);

	useUnmount(() => dispatch(changeActiveRoom(null)));

	return (
		<>
			<Room />
			<EmoticonPicker />
			<NickPicker />
			{imagePickImages && <ImagePickModal />}
			<ImageUploadModal />
		</>
	);
};

export default Chat;
