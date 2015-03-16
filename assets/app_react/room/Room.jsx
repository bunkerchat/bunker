var RoomStore = require('./../stores/roomStore');
var Messages = require('./Messages.jsx');
var InputBox = require('./InputBox.jsx');

var Room = React.createClass({
	mixins: [
		ReactRouter.Navigation,
		ReactRouter.State,
		Reflux.listenTo(RoomStore, 'onStoreUpdate'),
		//Reflux.ListenerMixin
	],

	room: {},

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

	componentWillReceiveProps: function () {
		this.setState(this.getStateFromStore());
	},

	onStoreUpdate(rooms) {
		this.setState(this.getStateFromStore());
	},

	render() {
		return (
			<div>
				<Messages room={this.state.room}/>
				<InputBox/>
			</div>
		);
	}
});

module.exports = Room;