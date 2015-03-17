var UserActions = require('../user/userActions');

var Input = React.createClass({
	sendMessage() {
		var text = this.refs.inputBox.getDOMNode().value;
		UserActions.sendMessage(this.props.room.id, text);
	},

	handleKeyDown(evt) {
		if (evt.keyCode == 13) { // enter
			evt.preventDefault();
			this.sendMessage();
			this.refs.inputBox.getDOMNode().value = '';
		}
	},

	render() {
		return (
			<div className="container-fluid message-input">
				<div className="row">
					<form className="col-md-10 no-gutter">
						<div className="input-group">
							<textarea rows="1" className="form-control"
								ref="inputBox" onKeyDown={this.handleKeyDown} autofocus></textarea>
							<span className="input-group-btn">
								<button type="submit" className="btn btn-success" onClick={this.sendMessage}>Send</button>
							</span>
						</div>
					</form>
				</div>
			</div>
		);
	}
});

module.exports = Input;