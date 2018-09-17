import React from "react";
import ReactDOM from "react-dom";
import Chat from "./components/chat/Chat.jsx";

import {history, store} from "./store.js";
import {ConnectedRouter} from "connected-react-router";
import {Route} from "react-router";
import { Provider } from "react-redux"

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
