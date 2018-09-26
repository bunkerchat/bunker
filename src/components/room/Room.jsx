import React from "react";
import ChatInput from "../input/ChatInput.jsx";
import MemberList from "./MemberList.jsx";
import ScrollingMessageList from "../message/ScrollingMessageList.jsx";

export default class Room extends React.Component {
	render() {
		const { roomId, current } = this.props;
		return (
			<div className="d-flex">
				<ScrollingMessageList roomId={roomId} current={current} />
				<MemberList roomId={roomId} />
				<ChatInput roomId={roomId} />
			</div>
		);
	}
}
