import { combineReducers } from 'redux'
import { createBrowserHistory } from 'history';
import { applyMiddleware, compose, createStore } from 'redux'
import { connectRouter, routerMiddleware } from 'connected-react-router'
const history = createBrowserHistory();

const rootReducer = combineReducers({
});

const store = createStore(
	connectRouter(history)(rootReducer), // new root reducer with router state
	compose(
		applyMiddleware(
			routerMiddleware(history), // for dispatching history actions
			// ... other middlewares ...
		),
	),
);

export {store, history};
