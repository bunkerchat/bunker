window._ = require("lodash");

import React from "react";
import ReactDOM from "react-dom";
import Chat from "./features/chat/Chat.jsx";

import { history, store } from "./store.js";
import { ConnectedRouter } from "connected-react-router";
import { Route, Redirect } from "react-router";
import { Provider } from "react-redux";

// Configure font-awesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCog, faEllipsisH, faGavel, faComments } from "@fortawesome/free-solid-svg-icons";
library.add(faCog, faEllipsisH, faGavel, faComments);

const root = ReactDOM.unstable_createRoot(document.getElementById("index"));
root.render(
	<Provider store={store}>
		<ConnectedRouter history={history}>
			<div>
				<Route exact path="/2" render={() => <Redirect to="/2/lobby" />} />
				<Route path="/" component={Chat} />
			</div>
		</ConnectedRouter>
	</Provider>
);
