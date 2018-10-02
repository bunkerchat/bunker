import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

const mapStateToProps = state => ({
	rooms: state.rooms
});

class Lobby extends React.PureComponent {
	render() {
		const { rooms } = this.props;
		return (
			<div className="container-fluid mt-3">
				<ul className="list-group">
					{_.map(rooms, (room, roomId) => (
						<Link className="list-group-item" to={`/2/room/${roomId}`} key={roomId}>
							{room.name}
						</Link>
					))}
				</ul>
			</div>
		);
	}
}

export default connect(mapStateToProps)(Lobby);
