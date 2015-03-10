var RoomStore = require('../roomStore');

module.exports = React.createClass({
	mixins: [Reflux.listenTo(MembershipStore, 'onStoreUpdate')],

	getInitialState() {
		return {
			roomMembers: []
		}
	},

	onStoreUpdate(roomMembers) {
		this.setState({roomMembers});
	},

	render() {
		var rooms = this.state.roomMembers.map(function (roomMember) {
			var room = roomMember.room;
			return (
				<li >
					<a title="{room.topic}" href="#/rooms/{room.id}">{room.name}</a>
					<span className="badge"></span>
				</li>
			)
		});

		return (
			<nav className="navbar navbar-default navbar-fixed-top navbar-background" role="navigation" ng-controller="HeaderController as header">
				<div className="container-fluid">
					<div className="navbar-header">
						<a className="navbar-brand" href="#/">Bunker</a>
					</div>
					<ul className="nav navbar-nav hidden-xs">
						{rooms}
					</ul>
				</div>
			</nav>
		);
	}
});