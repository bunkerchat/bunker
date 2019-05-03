import React, { useEffect, useMemo } from "react";
import { Modal } from "reactstrap";
import { connect } from "react-redux";
import { getImageFileUploads, setImageFilesToUpload, uploadImageFiles } from "./imageUploadReducer.js";
import { useImagePasteWatcher } from "./useImagePasteWatcher.js";

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
			<div className="modal-body">
				{images.map((src, index) => (
					<img src={src} key={index} />
				))}
			</div>
			<div className="modal-footer">
				<button className="btn btn-default" onClick={uploadImageFiles}>
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
