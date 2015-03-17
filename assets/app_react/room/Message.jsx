var Gravatar = require('./../components/Gravatar');
var cx = require('classnames');

var Message = React.createClass({
	render() {
		var message = this.props.message;

		var messageClass = cx({
			'message': true,
			'local': message.author.id == window.userId
		});

		var messageBodyClass = cx({
			'message-body': true,
			'new-message-body': message.$firstInSeries,
			'edited': message.edited
		});

		return (
			<li className="message-container">
				<div className={messageClass}>
					<div>
						<div className="message-author">
							{this.authorInfo(message)}
						</div>
							{this.caret(message)}
						<div className={messageBodyClass}>
							<span>{message.text}</span>
							<span className="message-info text-muted">
								{this.edited(message)}
								{this.timeStamp(message)}
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
	},

	edited(message) {
		if (!message.edited)return;
		return (
			<i className="fa fa-pencil"></i>
		)
	},

	timeStamp(message){
		if (!message.$firstInSeries)return;
		return (
			<span>
				<a className="text-muted">
					<small>{message.createdAt.format('l LTS')}</small>
				</a>
			</span>
		)
	}
});

module.exports = Message;