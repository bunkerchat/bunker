import Gravatar from "react-gravatar";
import React from "react";
import styled from "styled-components";

const AuthorContainer = styled.div`
	display: inline-block;
	width: 30px;
	min-height: 1px;
	vertical-align: top;
`;

export default class Author extends React.Component {
	render() {
		const { author } = this.props;
		return (
			<AuthorContainer>
				{this.props.firstInSeries && <Gravatar email={author.email} size={25} rating="pg" default="monsterid" />}
			</AuthorContainer>
		);
	}
}
