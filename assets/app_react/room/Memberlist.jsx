var Gravatar = require('./../components/Gravatar');
var cx = require('classnames');
var Status = require('./Status.jsx');

var MemberList = React.createClass({

	render() {
		return (
			<div className="col-md-2 hidden-sm hidden-xs no-gutter member-list">
				<ul className="list-group">
					{this.getMembers()}
				</ul>

				<div className="room-options">
					<a ui-sref="roomHistory({roomId: $root.roomId, date: room.now()})" ng-hide="$stateParams.date" className="btn btn-link">
						History
					</a>
				</div>
			</div>
		)
	},

	getMembers() {
		var members = this.props.room.$members;
		if(!members) return;

		return _.map(members, member => {
			var user = member.user;
			if(!user.connected) return;

			return (
				<li className="list-group-item">
					<span className="user-icon">
						<span >
							{this.getIsTyping(user)}
						</span>
					</span>

					<a>{user.nick}</a>

					<div className="pull-right">
						{this.memberRole(user)}
						<Status roomMember={this.props.room.$members[user.id]}/>
					</div>
				</li>
			)
		})
	},

	getIsTyping(user) {
		var room = this.props.room;

		if (user.typingIn == this.props.room.id) {
			return <i className="fa fa-ellipsis-h"></i>
		}

		return <Gravatar email={user.email} size={20} default="identicon"/>
	},

	memberRole(user){
		if(user.role == 'member') return;

		var icon = cx({
			'fa': true,
			'fa-gavel': user.role == 'administrator',
			'fa-comments': user.role == 'moderator'
		});

		return <i className={icon}></i>
	}

});

module.exports = MemberList;