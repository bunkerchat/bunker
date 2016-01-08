app.controller('RoomHistoryController', function ($scope, bunkerData, $stateParams, $state, $location, $anchorScroll, $timeout) {
	var room = this;
	room.roomId = $stateParams.roomId;
	room.user = bunkerData.user;

	room.message = $stateParams.message;
	$location.hash(room.message);

	var startDate;
	var endDate;

	room.messages = [];
	room.date; //need room for binding WHY?!!!!!!!!!!
	room.members = {};

	room.subDay = function () {
		room.date = moment(room.date).add(-1, 'days').hour(0).toDate();
	};

	room.addDay = function () {
		room.date = moment(room.date).add(1, 'days').hour(23).minute(59).toDate();
	};

	// hack :-( ng-changed doesn't work
	$scope.$watch('room.date', function (newVal, oldVal) {
		if (!oldVal || newVal == oldVal) return;

		setStartAndEnd(room.date);

		// getMessages() will be triggered by room
		//$location.search({date: startDate});
		$state.go('roomHistory', {roomId: room.roomId, date: startDate});
	});

	setStartAndEnd($stateParams.date);
	getMessages();

	function getMessages() {
		bunkerData.getHistoryMessages(room.roomId, startDate, endDate)
			.then(function(messages) {
				room.ready = true;
				room.rawMessages = messages;
				_.each(messages, function (message) {
					addMessage(message);
					if (message.author) {
						room.members[message.author._id] = message.author;
					}
				});

				$timeout($anchorScroll);
			});
	}

	function addMessage(message) {
		var lastMessage = _.last(room.messages);
		message.$firstInSeries = !lastMessage || !lastMessage.author || !message.author || lastMessage.author._id != message.author._id;
		message.$mentionsUser = bunkerData.mentionsUser(message.text);
		room.messages.push(message);
	}

	function setStartAndEnd(date) {
		startDate = moment(date).hour(0).minute(0);
		endDate = moment(date).hour(23).minute(59).second(59).toDate();
		room.date = moment(date).toDate();
	}

	room.openCalendar = function ($event) {
		$event.preventDefault();
		$event.stopPropagation();

		room.calendarOpened = true;
	};

	room.dateOptions = {
		formatYear: 'yy',
		startingDay: 1
	};

	room.format = 'yyyy-MM-dd';
});
