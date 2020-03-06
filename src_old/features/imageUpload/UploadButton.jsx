import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { loadImage } from "./imageLoader.js";
import { doSingleImageUpload } from "./imageUpload.js";
import theme from "../../constants/theme";
import { getActiveRoomId } from "../room/roomSelectors.js";
import { setAppendText } from "../chatInput/chatInputThunks";

const UploadContainer = styled.span`
	display: inline-block;
	background-color: transparent;
	position: relative;
	cursor: pointer;

	&:hover {
		color: ${theme.colors.primary};
	}
`;

const FileUpload = styled.input`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	opacity: 0;
	overflow: hidden;
	cursor: pointer;

	&:hover {
		color: ${theme.colors.primary};
	}

	&::-webkit-file-upload-button {
		cursor: pointer;
	}
`;

class UploadButton extends React.Component {
	fileUploadElement = null;
	state = { uploading: false };

	uploadFile = evt => {
		this.setState({ uploading: true });

		const file = _.first(evt.target.files);

		loadImage(file)
			.then(loadedData => {
				return doSingleImageUpload(loadedData.data.split(",")[1]);
			})
			.then(imageUrl => {
				this.props.setAppendText(imageUrl);
				this.fileUploadElement.value = "";
			})
			.finally(() => this.setState({ uploading: false }));
	};

	render() {
		if (!this.props.activeRoomId) {
			return null;
		}

		const iconToRender = this.state.uploading ? "spinner" : "cloud-upload-alt";
		const iconClasses = this.state.uploading ? "fa-spin" : "";

		return (
			<UploadContainer className="nav-item nav-link">
				<FontAwesomeIcon icon={iconToRender} className={iconClasses} />
				<FileUpload
					ref={el => (this.fileUploadElement = el)}
					type="file"
					name="image"
					accept="image/*"
					onChange={this.uploadFile}
				/>
			</UploadContainer>
		);
	}
}

const mapStateToProps = state => ({
	activeRoomId: getActiveRoomId(state)
});

const mapDispatchToProps = {
	setAppendText
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(UploadButton);
