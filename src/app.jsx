import React from "react";
import styled from "styled-components";
import theme from "./constants/theme";
import BunkerFavicon from "./features/chat/BunkerFavicon.jsx";
import EmoticonPreLoad from "./features/init/EmoticonPreLoad.jsx";
import Notify from "./features/notifications/Notify.jsx";
import Header from "./features/header/Header.jsx";
import { BrowserRouter as Router, Redirect, Route } from "react-router-dom";
import { Switch } from "react-router";
import Chat from "./features/chat/Chat.jsx";
import Lobby from "./features/lobby/Lobby.jsx";
import Settings from "./features/settings/Settings.jsx";

const Container = styled.div`
	display: flex;
	flex-direction: column;
	width: 100vw;
	height: 100vh;
	padding-top: ${theme.top}px;
`;

const App = () => {
	return (
		<Container>
			<Router>
				<>
					<BunkerFavicon />
					<EmoticonPreLoad />
					<Notify />
					<Header />
					<Switch>
						<Redirect exact from="/2" to="/2/lobby" />
						<Route path="/2/room/:roomId">
							<Lobby />
							<Chat />
						</Route>
						<Route path="/2/lobby">
							<Lobby />
							<Chat />
						</Route>
						<Route path="/2/settings">
							<Settings />
						</Route>
					</Switch>
				</>
			</Router>
		</Container>
	);
};

export default App;
