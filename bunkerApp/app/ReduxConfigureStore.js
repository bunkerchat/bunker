// import {applyMiddleware, createStore, compose} from 'redux'
// import thunk from 'redux-thunk'
// import rootReducer from './config/Redux'
//
// export default function configureStore (){
// 	const middleware = [thunk]
// 	const enhancers = [applyMiddleware(...middleware)]
//
// 	if (global.reduxNativeDevTools) {
// 		enhancers.push(global.reduxNativeDevTools(/*options*/))
// 	}
//
// 	return createStore(rootReducer, compose(...enhancers))
// }


/* eslint global-require: 0 */
import {createStore, applyMiddleware, compose} from 'redux'
import {composeWithDevTools} from 'redux-devtools-extension'
import thunk from 'redux-thunk'
import rootReducer from './config/Redux'

const middlewares = [thunk]
const enhancers = [applyMiddleware(...middlewares)]
let enhancer

if (global.reduxNativeDevTools) {
	enhancers.push(global.reduxNativeDevTools(/*options*/))
	enhancer = compose(...enhancers)
} else {
	// Options: https://github.com/jhen0409/react-native-debugger#options
	enhancer = composeWithDevTools({})(...enhancers)
}

export default function configureStore(initialState) {
	const store = createStore(rootReducer, initialState, enhancer)
	if (module.hot) {
		module.hot.accept(() => {
			store.replaceReducer(require('./config/Redux').default)
		})
	}
	return store
}
