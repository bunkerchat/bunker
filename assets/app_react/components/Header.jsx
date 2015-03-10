/** @jsx React.DOM */
var Router = require('react-router');

var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var MembershipStore = require('../user/membershipStore');

var Header = React.createClass({
	mixins: [Reflux.listenTo(MembershipStore, 'onStoreUpdate')],

	getInitialState () {
		return {
			roomMembers: []
		}
	},

	onStoreUpdate (roomMembers) {
		this.setState({ roomMembers });
	},

	render: function () {
		var rooms = this.state.roomMembers.map(function (roomMember) {
			var room = roomMember.room;
			var url = `#/rooms/${room.id}`;
			return (
				<li >
					<a title="{room.topic}" href="{url}">{room.name}</a>
					<span className="badge"></span>
				</li>
			)
		});

		return (
			<nav className="navbar navbar-default navbar-fixed-top navbar-background" role="navigation">
				<div className="container-fluid">
					<div className="navbar-header">
						<Link className="navbar-brand" to="app">Bunker</Link>
					</div>
					<ul className="nav navbar-nav hidden-xs">
						{rooms}
					</ul>
				</div>
			</nav>
		);
	}
});

module.exports = Header;