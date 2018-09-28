import { combineReducers } from "redux";
import { createBrowserHistory } from "history";
import { applyMiddleware, compose, createStore } from "redux";
import { connectRouter, routerMiddleware } from "connected-react-router";
import thunk from "redux-thunk";
const history = createBrowserHistory();

import user from "./reducers/user";
import userSettings from "./reducers/userSettings";
import rooms from "./reducers/rooms";
import messages from "./reducers/messages";
import users from "./reducers/users";
import log from "./reducers/log";

const rootReducer = combineReducers({
	user,
	userSettings,
	rooms,
	messages,
	users,
	log
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
	connectRouter(history)(rootReducer), // new root reducer with router state
	composeEnhancers(
		applyMiddleware(
			routerMiddleware(history), // for dispatching history actions
			thunk
			// ... other middlewares ...
		)
	)
);

const dispatch = store.dispatch;

export { store, history, dispatch };
