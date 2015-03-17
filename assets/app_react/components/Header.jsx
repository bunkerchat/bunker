/** @jsx React.DOM */
var Link = ReactRouter.Link;
var MembershipStore = require('./../stores/membershipStore');

var Header = React.createClass({
	mixins: [Reflux.listenTo(MembershipStore, 'onUpdate')],

	getInitialState() {
		return MembershipStore.getState();
	},

	onUpdate() {
		this.setState(MembershipStore.getState());
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
		return _.map(this.state.memberships, membership => {
			var room = membership.room;
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