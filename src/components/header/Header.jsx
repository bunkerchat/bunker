import React from 'react';
import {Link} from "react-router-dom";

export default class Header extends React.Component {
	render() {
		return (
			<div>
				<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
					<Link className="navbar-brand" to={`/2/lobby`}>Bunker</Link>
					<div className="navbar-nav">
						<Link className="nav-item nav-link" to={`/2/room/1`}>Room 1</Link>
						<Link className="nav-item nav-link" to={`/2/room/2`}>Room 2</Link>
						<Link className="nav-item nav-link" to={`/2/room/3`}>Room 3</Link>
					</div>
				</nav>
			</div>
		)
	}
}
