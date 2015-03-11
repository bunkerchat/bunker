var Router = require('react-router');
var RoomStore = require('./roomStore');

var Message = React.createClass({
	render() {
		var message = this.props.message;
		return (
			<li className="message-container">
				<div className="message">
					<div>
						<div className="message-author">
							<span>
								<div className="name">yay</div>
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

var Messages = React.createClass({
	mixins: [
		Router.Navigation,
		Router.State,
		Reflux.listenTo(RoomStore, 'onStoreUpdate')
	],

	getStateFromStore: function () {
		return {
			room: RoomStore.rooms[this.getParams().roomId]
		};
	},

	getInitialState: function () {
		return this.getStateFromStore();
	},

	//componentDidMount: function () {
	//	this.listenTo(RoomStore, this.onStoreUpdate);
	//},
	//
	//componentWillUnmount: function () {
	//	ContactStore.removeChangeListener(this.updateContact);
	//},
	//
	//componentWillReceiveProps: function () {
	//	this.setState(this.getStateFromStore());
	//},


	onStoreUpdate(rooms) {
		this.setState(this.getStateFromStore());
	},

	render() {
		var room = this.state.room;
		if (!room) return <div></div>;

		var messages = room.$messages.map(message => {
			return (
				<Message key={message.id} message={message}/>
			)
		});

		return (
			<div className="container-fluid">
				<div className="row">
					<div className="col-md-10 col-xs-12 no-gutter">
						<div>
							<ol className="list-unstyled message-list">
								{messages}
							</ol>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

module.exports = Messages;