var Message = require('./Message.jsx');

var Messages = React.createClass({
	mixins: [
		//Router.Navigation,
		//Router.State,
		//Reflux.listenTo(RoomStore, 'onStoreUpdate')
	],

	//getStateFromStore: function () {
	//	return {
	//		room: RoomStore.rooms[this.getParams().roomId]
	//	};
	//},
	//
	//getInitialState: function () {
	//	return this.getStateFromStore();
	//},
	//
	//onStoreUpdate(rooms) {
	//	this.setState(this.getStateFromStore());
	//},

	render() {
		var room = this.props.room;
		if (!room) return <div></div>;

		return (
			<div className="container-fluid">
				<div className="row">
					<div className="col-md-10 col-xs-12 no-gutter">
						<div>
							<ol className="list-unstyled message-list">
								{this.getMessages()}
							</ol>
						</div>
					</div>
				</div>
			</div>
		);
	},

	getMessages(){
		return this.props.room.$messages.map(message => {
			return (
				<Message key={message.id} message={message}/>
			)
		});
	}
});

module.exports = Messages;