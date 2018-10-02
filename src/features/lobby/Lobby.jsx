import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

const mapStateToProps = state => ({
	rooms: state.rooms
});

class Lobby extends React.PureComponent {
	render() {
		const { rooms } = this.props;
		const roomsSortedByUnread = _.sortBy(rooms, room => room.unreadMessageCount === 0);
		return (
			<div className="container-fluid mt-3">
				<ul className="list-group">
					{_.map(roomsSortedByUnread, room => (
						<Link
							className="list-group-item p-3 d-flex justify-content-between align-items-center"
							to={`/2/room/${room._id}`}
							key={room._id}
						>
							{room.name}
							{room.unreadMessageCount > 0 && (
								<span className="badge badge-primary d-md-none">{room.unreadMessageCount}</span>
							)}
						</Link>
					))}
				</ul>
			</div>
		);
	}
}

export default connect(mapStateToProps)(Lobby);
