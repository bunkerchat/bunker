import React from "react";
import styled from "styled-components";

const ChatInputContainer = styled.div`
	position: fixed;
	bottom: 0;
	width: 100vw;
`;

export default class ChatInput extends React.Component {
	render() {
		return (
			<ChatInputContainer className="bg-white">
				<input type="text" className="form-control"/>
				<div className="row">
					<div className="col">
						<button className="btn btn-link">
							Emoticons
						</button>
					</div>
					<div className="col text-right">
						<button className="btn btn-link">
							Upload
						</button>
						<button className="btn btn-success">
							Send
						</button>
					</div>
				</div>
			</ChatInputContainer>
		)
	}
}
