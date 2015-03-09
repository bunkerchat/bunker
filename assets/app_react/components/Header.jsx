/** @jsx React.DOM */

var MembershipStore = require('../user/membershipStore');
var UserStore = require('../user/userStore');

module.exports = React.createClass({

	render: function () {
		var rooms = this.rooms();
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
	},

	rooms: function () {
		return MembershipStore.memberships.map(function (roomMember) {
			var room = roomMember.room;
			return (
				<li >
					<a title="{room.topic}" href="#/rooms/{room.id}">{room.name}</a>
					<span className="badge"></span>
				</li>
			)
		});
	}
});