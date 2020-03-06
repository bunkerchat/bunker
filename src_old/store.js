import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { userTiming } from "./middleware/userTiming.js";

const middleware = getDefaultMiddleware({
	// TODO: a few reducers are not correctly immutable or serializable. Fix those and turn this back on
	// emoticonPicker is one
	immutableCheck: false,
	serializableCheck: false
});

const store = configureStore({
	reducer: rootReducer,
	middleware
});

if (process.env.NODE_ENV === "development" && module.hot) {
	module.hot.accept("./rootReducer", () => {
		const newRootReducer = require("./rootReducer").default;
		store.replaceReducer(newRootReducer);
	});
}

const dispatch = store.dispatch;

export { store, dispatch };
