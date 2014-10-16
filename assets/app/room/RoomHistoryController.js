app.controller('RoomHistoryController', function ($scope, bunkerApi, $stateParams, $location) {
	var room = this;
	var roomId = $stateParams.roomId;

	var startDate;
	var endDate;

	this.messages = [];
	this.date; //need this for binding WHY?!!!!!!!!!!

	// hack :-( ng-changed doesn't work
	$scope.$watch('room.date', function (newVal, oldVal) {
		if(!oldVal || newVal == oldVal) return;

		setStartAndEnd(room.date);

		// getMessages() will be triggered by this
		$location.search({date: startDate});
	});

	setStartAndEnd($stateParams.date);
	getMessages();

	function getMessages(){
		var query = { roomId: roomId, startDate: startDate, endDate: endDate};
		room.rawMessages = bunkerApi.history.query(query, function (messages) {
			_(messages).each(function (message) {
				addMessage(message);
			});
		});
	}

	function addMessage(message) {
		var lastMessage = _.last(room.messages);
		message.$firstInSeries = !lastMessage || !lastMessage.author || !message.author || lastMessage.author.id != message.author.id;
		room.messages.push(message);
	}

	function setStartAndEnd(date){
		startDate = moment(date).format('YYYY-MM-DD');
		endDate = moment(date).add(1, 'days').format('YYYY-MM-DD');
		room.date = moment(date).toDate();
	}
});
