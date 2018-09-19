import React from "react";
import MessageList from "../message/MessageList.jsx";

export default class Room extends React.Component {
	render() {
		const {room} = this.props;
		return (
			<div>
				<MessageList messages={room.$messages}/>
			</div>
		)
	}
}
