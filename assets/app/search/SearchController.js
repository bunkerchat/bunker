app.controller('SearchController', function ($state, $stateParams, bunkerData) {
	const search = this
	search.query = $stateParams.query
	search.messages = [];
	search.members = {};

	search.submit = function(){
		console.log('hi')

		$state.go('search', {query: search.query, reload:true})
	}

	search.hi = function(){
	}

	bunkerData.search($stateParams)
		.then(messages => {
			search.ready = true;
			search.rawMessages = messages;
			_.each(messages, message => {
				addMessage(message);
				if (message.author) {
					search.members[message.author._id] = message.author;
				}
			});
		})

	function addMessage(message) {
		message.$mentionsUser = bunkerData.mentionsUser(message.text);
		search.messages.push(message);
	}
});
