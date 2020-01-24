import React from "react";
import styled from "styled-components";
import theme from "../../constants/theme";
import { connect } from "react-redux";
import UserImage from "../users/UserImage.jsx";
import { getLocalUserId } from "../users/usersSelectors.js";

const AuthorContainer = styled.div`
	flex: 0 0 30px;
	min-height: 1px;
	vertical-align: top;
	overflow: hidden;
	position: relative;

	@media (min-width: 768px) {
		flex: 0 0 175px;
		background-color: ${theme.messageAuthorBackground};
		color: ${theme.messageAuthorText};

		&.local {
			background-color: ${theme.messageLocalAuthorBackground};
		}

		&.first:after {
			content: "";
			position: absolute;
			right: 0;
			top: 6px;
			width: 0;
			height: 0;
			border-bottom: 8px solid ${theme.messageAuthorCaret};
			border-bottom: 8px solid rgba(255, 255, 255, 0);
			border-top: 8px solid ${theme.messageAuthorCaret};
			border-top: 8px solid rgba(255, 255, 255, 0);
			border-right: 8px solid ${theme.messageAuthorCaret};
		}
	}
`;

const Nick = styled.div`
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	line-height: 25px;
`;

class MessageAuthor extends React.Component {
	render() {
		// Currently ignoring if the user wasn't returned
		// This happens when a user hasn't logged in in over 45 days
		// todo handle this better?
		const user = this.props.user || {};
		const { authorId, firstInSeries, localUserId } = this.props;

		const isLocalAuthor = authorId === localUserId;
		return (
			<AuthorContainer className={`pl-1 ${isLocalAuthor ? "local" : ""} ${firstInSeries ? "first" : ""}`}>
				{firstInSeries && (
					<div className="d-flex">
						<UserImage userId={authorId} />
						<Nick className="d-none d-md-inline-block ml-2">{user.nick}</Nick>
					</div>
				)}
			</AuthorContainer>
		);
	}
}

const mapStateToProps = state => ({
	localUserId: getLocalUserId(state)
});

export default connect(mapStateToProps)(MessageAuthor);
