var Gravatar = require('./../components/Gravatar');
var cx = require('classnames');

var Message = React.createClass({
	render() {
		var message = this.props.message;

		var messageClass = cx({
			'message-body': true,
			'new-message-body': message.$firstInSeries,
			'edited': message.edited
		});

		return (
			<li className="message-container">
				<div className="message">
					<div>
						<div className="message-author">
							{this.authorInfo(message)}
						</div>
							{this.caret(message)}
						<div className={messageClass}>
							<span>{message.text}</span>
							<span className="message-info text-muted">
								<i className="fa fa-pencil"></i>
								<span>
									<a className="text-muted">
										<small>time</small>
									</a>
								</span>
							</span>
						</div>
					</div>
				</div>
			</li>
		)
	},

	authorInfo(message) {
		if (!message.$firstInSeries)return;
		return (
			<span>
				<Gravatar email={message.author.email} size={20} default="identicon"/>
				<div className="name">{message.author.nick}</div>
				<span>x</span>
			</span>
		)
	},

	caret(message) {
		if (!message.$firstInSeries)return;
		return (
			<div className="message-caret"></div>
		)
	}
});

module.exports = Message;