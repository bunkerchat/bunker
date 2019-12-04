import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { createBrowserHistory } from "history";
import { connectRouter, routerMiddleware } from "connected-react-router";
// import thunk from "redux-thunk";
import rootReducer from "./rootReducer";

const history = createBrowserHistory();

const store = configureStore({
	reducer: connectRouter(history)(rootReducer),
	middleware: [routerMiddleware(history), ... getDefaultMiddleware()]
});

//
// const store = createStore(
// 	connectRouter(history)(rootReducer), // new root reducer with router state
// 	composeEnhancers(
// 		applyMiddleware(
// 			routerMiddleware(history), // for dispatching history actions
// 			thunk
// 			// ... other middlewares ...
// 		)
// 	)
// );

if (process.env.NODE_ENV === "development" && module.hot) {
	module.hot.accept("./rootReducer", () => {
		const newRootReducer = require("./rootReducer").default;
		store.replaceReducer(newRootReducer);
	});
}

const dispatch = store.dispatch;

export { store, history, dispatch };
