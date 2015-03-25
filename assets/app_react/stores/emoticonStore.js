var EmoticonStore = Reflux.createStore({
	listenables: [UserActions],
	emoticons: [],

	getState(){
		return this.emoticons
	}
});