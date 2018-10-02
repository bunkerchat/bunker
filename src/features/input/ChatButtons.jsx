import React from "react";
import styled from "styled-components";
import theme from "../../constants/theme";

const ButtonsContainer = styled.div`
	flex: 1;
`;

class ChatButtons extends React.PureComponent {
	render() {
		const { onSend } = this.props;
		return (
			<div className="d-flex">
				<ButtonsContainer>
					<button className="btn btn-link">Emoticons</button>
				</ButtonsContainer>
				<ButtonsContainer className="text-right">
					<button className="btn btn-link">Upload</button>
					<button type="button" className="btn btn-success rounded-0" onClick={onSend}>
						Send
					</button>
				</ButtonsContainer>
			</div>
		);
	}
}

export default ChatButtons;
