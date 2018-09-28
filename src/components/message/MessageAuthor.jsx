import Gravatar from "react-gravatar";
import React from "react";
import styled from "styled-components";
import theme from "../../constants/theme";
import userId from "../../constants/userId";

const AuthorContainer = styled.div`
	flex: 0 0 30px;
	min-height: 1px;
	vertical-align: top;
	overflow: hidden;

	@media (min-width: 768px) {
		flex: 0 0 175px;
		background-color: ${theme.messageAuthorBackground};
		color: ${theme.messageAuthorText};

		&.local {
			background-color: ${theme.messageLocalAuthorBackground};
		}
	}
`;

const AuthorNick = styled.div`
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export default class MessageAuthor extends React.PureComponent {
	render() {
		const { author } = this.props;
		const isLocalAuthor = author._id === userId;
		return (
			<AuthorContainer className={`pl-1 ${isLocalAuthor ? "local" : ""}`}>
				{this.props.firstInSeries && (
					<div className="d-flex">
						<Gravatar email={author.email} size={25} rating="pg" default="monsterid" />
						<AuthorNick className="d-none d-md-inline-block ml-2">{author.nick}</AuthorNick>
					</div>
				)}
			</AuthorContainer>
		);
	}
}
