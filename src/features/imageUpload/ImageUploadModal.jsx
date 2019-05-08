import React, { useEffect, useMemo } from "react";
import { Modal } from "reactstrap";
import { connect } from "react-redux";
import { getImageFileUploads, setImageFilesToUpload, uploadImageFiles } from "./imageUploadReducer.js";
import { useImagePasteWatcher } from "./useImagePasteWatcher.js";
import styled from "styled-components";

const FixedHeightImage = styled.img`
	max-width: 100%;
	max-height: 250px;
`;

const ImageUploadModal = ({ imageFiles, setImageFilesToUpload, uploadImageFiles }) => {
	const pastedImages = useImagePasteWatcher();
	useEffect(
		() => {
			setImageFilesToUpload(pastedImages);
		},
		[pastedImages]
	);

	const closeImageSelections = () => setImageFilesToUpload([]);

	const images = useMemo(() => imageFiles.map(file => window.URL.createObjectURL(file)), [imageFiles]);

	return (
		<Modal isOpen={!!images.length} size="lg" toggle={closeImageSelections}>
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
	imageFiles: getImageFileUploads(state)
});

const mapDispatchToProps = {
	setImageFilesToUpload,
	uploadImageFiles
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ImageUploadModal);
