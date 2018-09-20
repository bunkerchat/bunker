import React from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

const mapStateToProps = (state) => ({
	rooms: state.rooms
});

class Header extends React.Component {
	render() {
		const {rooms} = this.props;
		return (
			<div>
				<nav className="navbar navbar-expand navbar-dark bg-dark fixed-top">
					<Link className="navbar-brand" to={`/2/lobby`}>Bunker</Link>
					<div className="navbar-nav mr-auto">
						{_.map(rooms, room => (
							<Link className="nav-item nav-link" to={`/2/room/${room._id}`} key={room._id}>
								{room.name}
							</Link>
						))}
					</div>
					<div className="navbar-nav text-right">
						<Link className="nav-item nav-link" to={`/2/settings`}>
							<FontAwesomeIcon icon="cog"/>
						</Link>
					</div>
				</nav>
			</div>
		)
	}
}

export default connect(mapStateToProps)(Header);
