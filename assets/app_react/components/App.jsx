/** @jsx React.DOM */

var Header = require('./Header.jsx');
var Lobby = require('./Lobby.jsx');

module.exports = React.createClass({

	render: function () {
		return (
			<div>
				<Header />
				<Lobby />
			</div>
		);
	}
});