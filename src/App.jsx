import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { useTitle } from "react-use";
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
import { localUserLoaded } from "./features/users/localUserSelectors.js";
import Theme from "./features/settings/Theme.jsx";

const Container = styled.div`
	display: flex;
	flex-direction: column;
	width: 100vw;
	height: 100vh;
	padding-top: ${theme.top}px;
`;

const App = () => {
	useTitle("Bunker");
	const isLoaded = useSelector(localUserLoaded);

	return (
		<Container>
			<Theme />
			{isLoaded ? (
				<Router>
					<>
						<BunkerFavicon />
						<EmoticonPreLoad />
						<Notify />
						<Header />
						<Switch>
							<Redirect exact from="/" to="/lobby" />
							<Route path="/room/:roomId">
								<Lobby />
								<Chat />
							</Route>
							<Route path="/lobby">
								<Lobby />
								<Chat />
							</Route>
							<Route path="/settings">
								<Settings />
							</Route>
						</Switch>
					</>
				</Router>
			) : (
				<span>Loading...</span>
			)}
		</Container>
	);
};

export default App;
