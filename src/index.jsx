import BunkerFavicon from "./features/chat/BunkerFavicon.jsx";

window._ = require("lodash");

import React from "react";
import ReactDOM from "react-dom";
import Chat from "./features/chat/Chat.jsx";
import DocumentTitle from "./features/chat/DocumentTitle.jsx";
import EmoticonPreLoad from "./features/init/EmoticonPreLoad.jsx";
import { history, store } from "./store.js";
import { ConnectedRouter } from "connected-react-router";
import { Route, Redirect } from "react-router";
import { Provider } from "react-redux";

import { library } from "@fortawesome/fontawesome-svg-core"; // Configure font-awesome
import {
	faCog,
	faEllipsisH,
	faGavel,
	faComments,
	faCaretRight,
	faCaretDown,
	faCloudUploadAlt,
	faSpinner
} from "@fortawesome/free-solid-svg-icons";
import { faSmile, faEdit } from "@fortawesome/free-regular-svg-icons";

library.add(
	faCog,
	faEllipsisH,
	faGavel,
	faComments,
	faSmile,
	faEdit,
	faCaretRight,
	faCaretDown,
	faCloudUploadAlt,
	faSpinner
);

if (process.env.NODE_ENV !== "production") {
	const whyDidYouRender = require("@welldone-software/why-did-you-render/dist/no-classes-transpile/umd/whyDidYouRender.min.js");
	whyDidYouRender(React, {
		include: [/.*/],
		exclude: [/TimeAgo/, /StyledComponent/, /styled/, /FontAwesomeIcon/, /Gravatar/]
	});
}

ReactDOM.render(
	<Provider store={store}>
		<ConnectedRouter history={history}>
			<>
				<DocumentTitle />
				<BunkerFavicon />
				<EmoticonPreLoad />
				<Route exact path="/2" render={() => <Redirect to="/2/lobby" />} />
				<Route path="/" component={Chat} />
			</>
		</ConnectedRouter>
	</Provider>,
	document.getElementById("index")
);
