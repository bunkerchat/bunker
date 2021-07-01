import React from "react";
import styled from "styled-components";
import { emoticonNameHash } from "../../constants/emoticons";
import { connect } from "react-redux";

const Emoticon = styled.span`
	img {
		max-height: 24px;
	}
`;

const mapStateToProps = (state, props) => ({
	nicks: _(props.reactions)
		.map(reaction => state.users[reaction.author]?.nick)
		.orderBy()
		.join(", ")
});

class MessageReaction extends React.PureComponent {
	render() {
		const { emoticonName, reactions, nicks } = this.props;

		const emoticon = emoticonNameHash[emoticonName];
		const title = `:${emoticonName}: from ${nicks}`;
		return (
			<Emoticon key={emoticonName} className="px-1">
				<img src={`/assets/images/emoticons/${emoticon.file}`} alt={`:${emoticonName}:`} title={title} />
				<span>{reactions.length > 1 ? reactions.length : ""}</span>
			</Emoticon>
		);
	}
}

export default connect(mapStateToProps)(MessageReaction);
