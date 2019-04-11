import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ImageItem from './ImageItem.js';
import imageUpload from './imageUpload.js';
import styled from 'styled-components';

const UploadContainer = styled.a`
	display: inline-block;
	background-color: transparent;
	position: relative;
	cursor: pointer;
`;

const FileUpload = styled.input`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	opacity: 0;
`;

export default class UploadButton extends React.Component {

	constructor(props) {
		super(props);
		this.state = {uploading: false};
	}

	uploadFile(evt) {
		this.setState({uploading: true});

		const file = _.first(evt.target.files);
		const image = new ImageItem(file);

		image
			.loadData(file)
			.then(loadedData => {
				return imageUpload.doSingleImageUpload(loadedData.data.split(',')[1])
			})
			.then(imageUrl => {
				console.log(imageUrl);
			})
			.finally(() => this.setState({uploading: false}));
	}

	render() {

		const iconToRender = this.state.uploading ? 'spinner' : 'cloud-upload-alt';
		const iconClasses = this.state.uploading ? 'fa-spin' : '';

		return (
			<UploadContainer className="nav-item nav-link">
				<FontAwesomeIcon icon={iconToRender} className={iconClasses} />
				<FileUpload type="file" name="image" accept="image/*" onChange={(e) => this.uploadFile(e)} />
			</UploadContainer>);
	}
}
