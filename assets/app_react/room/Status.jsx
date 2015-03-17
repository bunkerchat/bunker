var cx = require('classnames');

var Status = React.createClass({
	render() {
		var statusClass = cx({
			'status': true,
			'here': true
			//'here': user.connected && !away(),
			//'local': user.connected && away()
		});

		return (
			<span className={statusClass}></span>
		)
	}
});

module.exports = Status;