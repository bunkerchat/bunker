/** @jsx React.DOM */
var Router = require('react-router');
var Link = Router.Link;

var MembershipStore = require('../user/membershipStore');

var Header = React.createClass({
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
		var rooms = this.state.roomMembers.map(roomMember => {
			var room = roomMember.room;
			return (
				<li >
					<Link title="room.topic" to="rooms" params={{roomId: room.id}}>{room.name}</Link>
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