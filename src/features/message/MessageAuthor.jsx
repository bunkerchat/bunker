import React from "react";
import styled from "styled-components";
import theme from "../../constants/theme";
import userId from "../../constants/userId";
import { connect } from "react-redux";
import UserImage from "../users/UserImage.jsx";
import { getAuthorUser } from "../../selectors/selectors";

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

const mapStateToProps = (state, props) => ({
	user: getAuthorUser(state, props)
});

class MessageAuthor extends React.Component {

	shouldComponentUpdate(prevProps) {
		const {user} = this.props;
		return user.connected !== prevProps.user.connected || user.present !== prevProps.user.present;
	}

	render() {
		const { user } = this.props;
		const isLocalAuthor = this.props.authorId === userId;
		return (
			<AuthorContainer className={`pl-1 ${isLocalAuthor ? "local" : ""}`}>
				{this.props.firstInSeries && (
					<div className="d-flex">
						<UserImage user={user} />
						<AuthorNick className="d-none d-md-inline-block ml-2">{user.nick}</AuthorNick>
					</div>
				)}
			</AuthorContainer>
		);
	}
}

export default connect(mapStateToProps)(MessageAuthor);
