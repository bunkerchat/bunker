import React from "react";
import styled from "styled-components";
import emoticons from "../../constants/emoticons";
import { connect } from "react-redux";

const Emoticon = styled.span`
	img {
		max-height: 24px;
	}
`;

const mapStateToProps = state => ({
	users: state.users
});

class MessageReaction extends React.PureComponent {
	render() {
		const { emoticonName, reactions } = this.props;

		const emoticon = _.find(emoticons.imageEmoticons, { name: emoticonName });
		const authors = _.map(reactions, reaction => this.props.users[reaction.author]);
		const title = `:${emoticonName}: from ${_.map(authors, 'nick').join(", ")}`;
		return (
			<Emoticon key={emoticonName} className="px-1">
				<img src={`/assets/images/emoticons/${emoticon.file}`} alt={`:${emoticonName}:`} title={title}/>
				<span>{reactions.length > 1 ? reactions.length : ""}</span>
			</Emoticon>
		);
	}
}

export default connect(mapStateToProps)(MessageReaction);
