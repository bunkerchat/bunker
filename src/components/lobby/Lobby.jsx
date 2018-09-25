import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

const mapStateToProps = state => ({
	rooms: state.rooms
});

class Lobby extends React.Component {
	render() {
		const { rooms } = this.props;
		return (
			<div className="container-fluid">
				{_.map(rooms, (room, roomId) => (
					<div key={roomId}>
						<Link to={`/2/room/${roomId}`}>{room.name}</Link>
					</div>
				))}
			</div>
		);
	}
}

export default connect(mapStateToProps)(Lobby);
