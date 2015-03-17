var md5 = require('md5');
var querystring = require('querystring');

var Gravatar = React.createClass({
	displayName: 'Gravatar',
	propTypes: {
		size: React.PropTypes.number.isRequired,
		rating: React.PropTypes.string.isRequired,
		https: React.PropTypes.bool.isRequired,
		"default": React.PropTypes.string.isRequired,
		email: React.PropTypes.string.isRequired
	},
	getDefaultProps() {
		return {
			size: 50,
			rating: 'g',
			https: false,
			"default": "retro"
		};
	},
	render() {
		var base, query, src;
		base = this.props.https ? "https://secure.gravatar.com/avatar/" : 'http://www.gravatar.com/avatar/';
		query = querystring.stringify({
			s: this.props.size,
			r: this.props.rating,
			d: this.props["default"]
		});
		src = base + md5.digest_s(this.props.email) + "?" + query;

		return React.createElement("img", {
			"className": "react-gravatar",
			"src": src,
			"alt": this.props.email,
			"height": this.props.size,
			"width": this.props.size
		});
	}
});

module.exports = Gravatar;