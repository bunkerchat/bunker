import React from 'react';

export default class Header extends React.Component {
	render() {
		return (
			<div>
				<nav className="navbar navbar-expand-lg navbar-light bg-light">
					<a className="navbar-brand" href="#">Bunker</a>
						<div className="navbar-nav">
							<a className="nav-item nav-link" href="#">Room 1</a>
							<a className="nav-item nav-link" href="#">Room 2</a>
							<a className="nav-item nav-link" href="#">Room 3</a>
						</div>
				</nav>
			</div>
		)
	}
}
