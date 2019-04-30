import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import MessageTimeAgo from "./MessageTimeAgo.jsx";
import { getMessageAuthor } from "../../selectors/selectors";
import MessageReactions from "./MessageReactions.jsx";
import MessageTokens from "./MessageTokens.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MessageImages from "./MessageImages.jsx";
import MessageBodyContainer from "./MessageBodyContainer.jsx";

const MessageTime = styled.div`
	width: 120px;
`;

class MessageBody extends React.Component {
	shouldComponentUpdate(nextProps) {
		const { message } = this.props;
		return (
			message.text !== nextProps.message.text ||
			this.props.isSelectedMessage !== nextProps.isSelectedMessage ||
			(message.reactions || []).length !== (nextProps.message.reactions || []).length ||
			message.imagesVisible !== nextProps.message.imagesVisible
		);
	}

	render() {
		const { message, firstInSeries, author } = this.props;
		return (
			<MessageBodyContainer message={message} firstInSeries={firstInSeries}>
				{firstInSeries && (
					<div className="row d-md-none">
						<div className="col">
							<h6>{author ? author.nick : "Unknown"}</h6>
						</div>
						<div className="col text-right">
							<small className="text-muted">
								<MessageTimeAgo date={message.createdAt}/>
							</small>
						</div>
					</div>
				)}
				<div className="row no-gutters px-2">
					<div className="col">
						<MessageTokens message={message}/>
						<MessageReactions message={message}/>
						<MessageImages message={message}/>
					</div>
					{firstInSeries && (
						<MessageTime className="d-none d-md-block text-right">
							<small className="text-muted">
								<MessageTimeAgo date={message.createdAt}/>
							</small>
						</MessageTime>
					)}
					{message.edited && <FontAwesomeIcon icon={["far", "edit"]} className="ml-2 my-1 text-muted"/>}
				</div>
			</MessageBodyContainer>
		);
	}
}

const mapStateToProps = (state, props) => ({
	author: getMessageAuthor(state, props),
	isSelectedMessage: state.messageControls.messageId === props.message._id
});

export default connect(mapStateToProps)(MessageBody);
