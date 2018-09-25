import React from "react";

class ChatButtons extends React.Component {
	render() {
		const { onSend } = this.props;
		return (
			<div className="row">
				<div className="col">
					<button className="btn btn-link">Emoticons</button>
				</div>
				<div className="col text-right">
					<button className="btn btn-link">Upload</button>
					<button type="button" className="btn btn-success" onClick={onSend}>
						Send
					</button>
				</div>
			</div>
		);
	}
}

export default ChatButtons;
