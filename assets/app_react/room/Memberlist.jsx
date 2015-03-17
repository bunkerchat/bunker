var Status = require('./Status.jsx');
var cx = require('classnames');

var MemberList = React.createClass({

	render(){
		return (
			<div className="col-md-2 hidden-sm hidden-xs no-gutter member-list">
				<ul className="list-group">
					<li className="list-group-item">
						<span className="user-icon">
							<span >
								<i className="fa fa-ellipsis-h"></i>
							</span>
						</span>

						<a>nick</a>

						<div className="pull-right">
							<span title="_MEMBERROLE_">
								<i className="fa fa-gavel" ng-switch-when="administrator"></i>
							</span>
							<Status/>
						</div>
					</li>
				</ul>

				<div className="room-options">
					<a ui-sref="roomHistory({roomId: $root.roomId, date: room.now()})" ng-hide="$stateParams.date" className="btn btn-link">
						History
					</a>
				</div>
			</div>
		)
	}
});

module.exports = MemberList;