import {applyMiddleware, createStore, compose} from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './Redux'

export default function configureStore (){
	const middleware = [thunk]
	const enhancers = [applyMiddleware(...middleware)]

	if (global.reduxNativeDevTools) {
		enhancers.push(global.reduxNativeDevTools(/*options*/))
	}

	return createStore(rootReducer, compose(...enhancers))
}
