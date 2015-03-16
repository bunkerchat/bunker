var Router = require('react-router');
var RouteHandler = Router.RouteHandler;

//var RoomStore = require('./roomStore');
var Messages = require('./Messages.jsx');

var Room = React.createClass({
	mixins: [
		Router.Navigation,
		Router.State,
		//Reflux.listenTo(RoomStore, 'onStoreUpdate'),
		//Reflux.ListenerMixin
	],

	getStateFromStore: function () {
		return {
			//room: RoomStore.rooms[this.getParams().roomId]
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
		//this.setState(this.getStateFromStore());
	},

	render() {
		return (
			<div>
				<RouteHandler {...this.props}/>
			</div>
		);
	}
});

module.exports = Room;