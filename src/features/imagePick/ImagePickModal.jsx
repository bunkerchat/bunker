import React from "react";
import { Modal } from "reactstrap";
import { connect } from "react-redux";
import { closeImageSelections } from "./imagePickActions";
import Image from "./Image.jsx";

const ImagePickModal = ({ images, closeImageSelections }) => (
	<Modal isOpen={true} size="lg" toggle={closeImageSelections}>
		{images.length > 0 && (
			<div className="modal-header">
				<h5 className="modal-title">Select an image</h5>
				<button type="button" className="close" data-dismiss="modal" aria-label="Close"
								onClick={closeImageSelections}>
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
		)}
		<div className="modal-body">
			{images.length > 0 ? (
				images.map((image, index) => (
					<Image image={image} key={index}/>
				))
			) : (
				<div>No images found</div>
			)}
		</div>
		<div className="modal-footer">
			<button className="btn btn-default" onClick={closeImageSelections}>
				{images.length > 0 ? "Cancel" : "Close"}
			</button>
		</div>
	</Modal>
);

const mapStateToProps = state => ({
	images: state.imagePick.images
});

const mapDispatchToProps = {
	closeImageSelections
};

export default connect(mapStateToProps, mapDispatchToProps)(ImagePickModal);
