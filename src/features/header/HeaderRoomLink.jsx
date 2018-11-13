import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import UnreadMessageBadge from "./UnreadMessageBadge.jsx";

const FloatingRightBadge = styled.div`
	position: absolute;
	top: 0px;
	right: -3px;
`;

export default class HeaderRoomLink extends React.PureComponent {
	render() {
		const { roomId, roomName, unreadMention, unreadMessageCount } = this.props;
		return (
			<Link className="nav-link" to={`/2/room/${roomId}`}>
				{roomName}{" "}
				{unreadMessageCount > 0 && (
					<FloatingRightBadge>
						<UnreadMessageBadge className={`badge badge-primary ${unreadMention ? "mention" : ""}`}>
							{unreadMessageCount}
						</UnreadMessageBadge>
					</FloatingRightBadge>
				)}
			</Link>
		);
	}
}
