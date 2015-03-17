var Gravatar = require('./../components/Gravatar');
var cx = require('classnames');

var Message = React.createClass({
	render() {
		var message = this.props.message;

		var messageClass = cx({
			'message': true,
			'local': message.author.id == window.userId
		});

		return (
			<li className="message-container">
				<div className={messageClass}>
					{message.author ? this.renderMessage() : this.systemMessage()}
				</div>
			</li>
		)
	},

	renderMessage() {
		var message = this.props.message;
		var messageBodyClass = cx({
			'message-body': true,
			'new-message-body': message.$firstInSeries,
			'edited': message.edited
		});

		return (
			<div>
				<div className="message-author">
					{this.authorInfo()}
				</div>
				{this.caret()}
				<div className={messageBodyClass}>
					<span>{message.text}</span>
					<span className="message-info text-muted">
						{this.edited()}
						{this.timeStamp()}
					</span>
				</div>
			</div>
		)
	},

	systemMessage() {
		var message = this.props.message;
		return (
			<div class="new-message-body">
				<div class="alert alert-message text-muted">
					<span>{message.text}</span>
				</div>
				<span class="message-info text-muted">
					{this.timeStamp()}
				</span>
			</div>
		)
	},

	authorStatus(){
		var room = this.props.room;

		var statusClass = cx({
			'status': true,
			'here':true
			//'here': user.connected && !away(),
			//'local': user.connected && away()
		});

		return (
			<span className={statusClass}></span>
		)
	},

	authorInfo() {
		var message = this.props.message;
		if (!message.$firstInSeries)return;
		return (
			<span>
				<Gravatar email={message.author.email} size={20} default="identicon"/>
				<div className="name">{message.author.nick}</div>
				{this.authorStatus()}
			</span>
		)
	},

	caret() {
		var message = this.props.message;
		if (!message.$firstInSeries)return;
		return (
			<div className="message-caret"></div>
		)
	},

	edited() {
		if (!this.props.message.edited)return;
		return (
			<i className="fa fa-pencil"></i>
		)
	},

	timeStamp() {
		var message = this.props.message;
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