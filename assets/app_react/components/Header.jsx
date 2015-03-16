/** @jsx React.DOM */
var Link = ReactRouter.Link;
var RoomStore = require('./../stores/roomStore');

var Header = React.createClass({
	mixins: [Reflux.listenTo(RoomStore, 'onUpdate')],

	getInitialState() {
		return RoomStore.getDefaultData();
	},

	onUpdate(rooms) {
		this.setState({rooms});
	},

	render() {
		return (
			<nav className="navbar navbar-default navbar-fixed-top navbar-background" role="navigation">
				<div className="container-fluid">
					<div className="navbar-header">
						<a href="#" className="navbar-brand">Bunker</a>
					</div>
					<ul className="nav navbar-nav hidden-xs">
						{this.getRooms()}
					</ul>
				</div>
			</nav>
		);
	},

	getRooms() {
		return _.map(this.state.rooms, room => {
			return (
				<li>
					<Link to="rooms" params={{roomId: room.id}} key={room.id}>{room.name}</Link>
					<span className="badge"></span>
				</li>
			)
		});
	}
});

module.exports = Header;