window._ = require("lodash");

import React from "react";
import ReactDOM from "react-dom";
import { store } from "./store.js";
import { Provider } from "react-redux";
import App from "./app";

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
		<App />
	</Provider>,
	document.getElementById("index")
);
