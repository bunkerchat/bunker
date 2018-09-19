import { combineReducers } from "redux"
import { createBrowserHistory } from "history";
import { applyMiddleware, compose, createStore } from "redux"
import { connectRouter, routerMiddleware } from "connected-react-router"
import thunk from "redux-thunk";
const history = createBrowserHistory();

import rooms from "./reducers/rooms";
import log from "./reducers/log";

const rootReducer = combineReducers({
	rooms,
	log
});

const store = createStore(
	connectRouter(history)(rootReducer), // new root reducer with router state
	compose(
		applyMiddleware(
			routerMiddleware(history), // for dispatching history actions
			thunk
			// ... other middlewares ...
		),
	),
);

const dispatch = store.dispatch;

export {store, history, dispatch};
