import Gravatar from "react-gravatar";
import React from "react";
import styled from "styled-components";
import userId from "../../constants/userId";

const AuthorContainer = styled.div`
	display: inline-block;
	width: 30px;
	min-height: 1px;
	vertical-align: top;
`;

export default class Author extends React.Component {
	render() {
		const { author } = this.props;
		const isLocalAuthor = author._id === userId;
		return (
			<AuthorContainer className={isLocalAuthor && "float-right float-md-none"}>
				{this.props.firstInSeries && <Gravatar email={author.email} size={25} rating="pg" default="monsterid" />}
			</AuthorContainer>
		);
	}
}
