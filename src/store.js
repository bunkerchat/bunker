import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { createBrowserHistory } from "history";
import { connectRouter, routerMiddleware } from "connected-react-router";
import rootReducer from "./rootReducer";

const history = createBrowserHistory();

const middleware = getDefaultMiddleware({
	// TODO: a few reducers are not correctly immutable or serializable. Fix those and turn this back on
	// emoticonPicker is one
	immutableCheck: false,
	serializableCheck: false
});

const store = configureStore({
	reducer: connectRouter(history)(rootReducer),
	middleware: [routerMiddleware(history), ...middleware]
});

if (process.env.NODE_ENV === "development" && module.hot) {
	module.hot.accept("./rootReducer", () => {
		const newRootReducer = require("./rootReducer").default;
		store.replaceReducer(newRootReducer);
	});
}

const dispatch = store.dispatch;

export { store, history, dispatch };
