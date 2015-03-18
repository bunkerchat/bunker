var cx = require('classnames');

var Status = React.createClass({
	render() {
		var roomMember = this.props.roomMember;;
		var statusClass = cx({
			'status': true,
			'here': roomMember && roomMember.user.connected && !this.away(roomMember),
			'away': roomMember && roomMember.user.connected && this.away(roomMember)
		});

		return (
			<span className={statusClass}></span>
		)
	},

	away(roomMember){
		return !roomMember.present && roomMember.lastActivity.diff('minutes') > 5;
	}

});

module.exports = Status;