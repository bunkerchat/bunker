var Router = require('react-router');
var RoomStore = require('./roomStore');

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
		if(!room) return <div></div>;

		return (
			<div>yay room</div>
		);
	}
});

module.exports = Messages;