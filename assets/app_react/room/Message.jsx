var Gravatar = require('./../components/Gravatar');
var Status = require('./Status.jsx');
var cx = require('classnames');

var Message = React.createClass({
	render() {
		var message = this.props.message;

		return (
			<li className="message-container">
				{message.author ? this.renderMessage() : this.systemMessage()}
			</li>
		)
	},

	renderMessage() {
		var message = this.props.message;
		var author = message.author;

		var messageClass = cx({
			'message': true,
			'local': author && author.id == window.userId
		});

		var messageBodyClass = cx({
			'message-body': true,
			'new-message-body': message.$firstInSeries,
			'edited': message.edited
		});

		return (
			<div className={messageClass}>
				<div className="message-author">
					{this.authorInfo()}
				</div>
				{this.caret()}
				<div className={messageBodyClass}>
					<span dangerouslySetInnerHTML={{__html: message.text}}></span>
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
			<div className="new-message-body">
				<div className="alert alert-message text-muted">
					<span dangerouslySetInnerHTML={{__html: message.text}}></span>
				</div>
				<span className="message-info text-muted">
					{this.timeStamp()}
				</span>
			</div>
		)
	},

	authorInfo() {
		var message = this.props.message;
		if (!message.$firstInSeries)return;
		if (!this.props.room.$members)return;

		return (
			<span>
				<Gravatar email={message.author.email} size={20} default="identicon"/>
				<div className="name">{message.author.nick}</div>
				<Status roomMember={this.props.room.$members[message.author.id]}/>
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