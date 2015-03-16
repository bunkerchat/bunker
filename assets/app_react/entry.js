require("!style!css!./../styles/default.css");

var Router = require('react-router');

var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var NotFoundRoute = Router.NotFoundRoute;

//var MembershipStore = require('./user/membershipStore');
//var UserStore = require('./user/userStore');
//var RoomStore = require('./room/roomStore');

var Header = require('./components/Header.jsx');
var Lobby = require('./components/Lobby.jsx');
var Room = require('./room/Room.jsx');
var RoomNotFound = require('./room/RoomNotFound.jsx');
var Messages = require('./room/Messages.jsx');

var App = require('./App.jsx')
var routes = (
	<Route name="app" path="/" handler={App}>

		<Route name="room" path="/room" handler={Room}>
			<NotFoundRoute handler={RoomNotFound}/>
			<Route name="messages" path="/room/:roomId" handler={Messages}/>
			<DefaultRoute handler={Lobby}/>
		</Route>

		<DefaultRoute handler={Lobby}/>
	</Route>
);

Router.run(routes, function (Handler) {
	React.render(<Handler/>, document.body);
});

module.exports = App;