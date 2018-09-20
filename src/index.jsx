window._ = require("lodash");

import React from "react";
import ReactDOM from "react-dom";
import Chat from "./components/chat/Chat.jsx";

import {history, store} from "./store.js";
import {ConnectedRouter} from "connected-react-router";
import {Route} from "react-router";
import {Provider} from "react-redux";

// Configure font-awesome
import {library} from '@fortawesome/fontawesome-svg-core';
import {faCog} from '@fortawesome/free-solid-svg-icons';
library.add(faCog);

ReactDOM.render(
	<Provider store={store}>
		<ConnectedRouter history={history}>
			<div>
				<Route path="/" component={Chat}/>
			</div>
		</ConnectedRouter>
	</Provider>,
	document.getElementById("index")
);
