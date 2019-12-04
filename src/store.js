import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { createBrowserHistory } from "history";
import { connectRouter, routerMiddleware } from "connected-react-router";
import rootReducer from "./rootReducer";

const history = createBrowserHistory();

const store = configureStore({
	reducer: connectRouter(history)(rootReducer),
	middleware: [routerMiddleware(history), ... getDefaultMiddleware()]
});


if (process.env.NODE_ENV === "development" && module.hot) {
	module.hot.accept("./rootReducer", () => {
		const newRootReducer = require("./rootReducer").default;
		store.replaceReducer(newRootReducer);
	});
}

const dispatch = store.dispatch;

export { store, history, dispatch };
