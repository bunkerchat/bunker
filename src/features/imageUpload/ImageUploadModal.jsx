import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "reactstrap";
import { connect } from "react-redux";
import styled from "styled-components";
import { useImagePasteWatcher } from "./useImagePasteWatcher.js";
import { loadImage } from "./imageLoader";
import { doSingleImageUpload } from "./imageUpload";
import { appendText } from "../chatInput/chatInputReducer";
import { getActiveRoomId } from "../room/roomSelectors.js";

const FixedHeightImage = styled.img`
	max-width: 100%;
	max-height: 250px;
`;

const ImageUploadModal = ({ activeRoomId, appendText }) => {
	const pastedImages = useImagePasteWatcher();
	const [open, setOpen] = useState(false);
	const closeImageSelections = () => setOpen(false);
	const images = useMemo(() => pastedImages.map(file => window.URL.createObjectURL(file)), [pastedImages]);

	useEffect(
		() => {
			pastedImages.length > 0 && setOpen(true);
		},
		[pastedImages]
	);

	const uploadImageFiles = () => {
		return loadImage(pastedImages[0])
			.then(loadedData => doSingleImageUpload(loadedData.data.split(",")[1]))
			.then(imageUrl => appendText(activeRoomId, imageUrl))
			.finally(() => closeImageSelections());
	};

	return (
		<Modal isOpen={open} size="lg" toggle={closeImageSelections}>
			<div className="modal-header">
				<h5 className="modal-title">Upload an image</h5>
				<button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={closeImageSelections}>
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div className="modal-body text-center">
				{images.map((src, index) => (
					<FixedHeightImage src={src} key={index} />
				))}
			</div>
			<div className="modal-footer">
				<button className="btn btn-primary" onClick={uploadImageFiles}>
					Upload
				</button>
			</div>
		</Modal>
	);
};

const mapStateToProps = state => ({
	activeRoomId: getActiveRoomId(state)
});

const mapDispatchToProps = {
	appendText
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ImageUploadModal);
