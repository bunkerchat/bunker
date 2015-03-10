require("!style!css!./../styles/default.css");

var Router = require('react-router');

var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var MembershipStore = require('./user/membershipStore');
var UserStore = require('./user/userStore');
var RoomStore = require('./room/roomStore');

var Header = require('./components/Header.jsx');
var Lobby = require('./components/Lobby.jsx');

var App =  React.createClass({
	render () {
		return (
			<div>
				<Header />
				<RouteHandler/>
			</div>
		);
	}
});

var routes = (
	<Route name="app" path="/" handler={App}>
		<DefaultRoute handler={Lobby}/>
	</Route>
);

Router.run(routes, function (Handler) {
	React.render(<Handler/>, document.body);
});

module.exports = App;