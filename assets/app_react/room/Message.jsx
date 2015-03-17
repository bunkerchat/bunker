var Message = React.createClass({
	render() {
		var message = this.props.message;
		return (
			<li className="message-container">
				<div className="message">
					<div>
						<div className="message-author">
							<span>
								<div className="name">{message.author.nick}</div>
								<span>x</span>
							</span>
						</div>
						<div className="message-caret"></div>
						<div className="message-body new-message-body">
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
	}
});

module.exports = Message;