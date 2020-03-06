import React from 'react';
import './App.css';
import { Switch } from "react-router";
import { BrowserRouter as Router, Redirect, Route } from "react-router-dom";
import { Link } from "react-router-dom";

const Chat = () => { return <span> CHAT!</span>}
const Lobby = () => { return <span> Lobby!</span>}
const Settings = () => { return <span> Settings!</span>}

function App() {
  return (
    <div className="App">
			<Router>
				<>
					<Link to="/2/lobby"> lobby </Link>
					<Link to="/2/room/asdf"> room </Link>
					<Link to="/2/settings"> settings </Link>
					<Switch>
						<Redirect exact from="/2" to="/2/lobby" />
						<Route path="/2/room/:roomId">
							<Chat />
						</Route>
						<Route path="/2/lobby">
							<Lobby />
						</Route>
						<Route path="/2/settings">
							<Settings />
						</Route>
					</Switch>
				</>
			</Router>
    </div>
  );
}

export default App;
