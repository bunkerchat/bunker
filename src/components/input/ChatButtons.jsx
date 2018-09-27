import React from "react";
import styled from "styled-components";
import theme from "../../constants/theme";

const LookupButtons = styled.div`
	flex: 1;
	background-color: ${theme.chatButtonBackground};
`;

const SubmitButtons = styled.div`
	flex: 1;
	background-color: ${theme.chatButtonBackground};
`;

class ChatButtons extends React.Component {
	render() {
		const { onSend } = this.props;
		return (
			<div className="d-flex">
				<LookupButtons>
					<button className="btn btn-link">Emoticons</button>
				</LookupButtons>
				<SubmitButtons className="text-right">
					<button className="btn btn-link">Upload</button>
					<button type="button" className="btn btn-success rounded-0" onClick={onSend}>
						Send
					</button>
				</SubmitButtons>
			</div>
		);
	}
}

export default ChatButtons;
