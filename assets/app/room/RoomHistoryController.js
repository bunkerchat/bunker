app.controller('RoomHistoryController', function ($scope, bunkerData, $stateParams, $state, $location, $anchorScroll, $timeout) {
	var self = this;
	this.roomId = $stateParams.roomId;
	this.message = $stateParams.message;
	this.user = bunkerData.user;

	var startDate;
	var endDate;

	this.messages = [];
	this.date; //need this for binding WHY?!!!!!!!!!!
	this.members = {};

	this.subDay = function () {
		self.date = moment(self.date).add(-1, 'days').toDate();
	};

	this.addDay = function () {
		self.date = moment(self.date).add(1, 'days').toDate();
	};

	// hack :-( ng-changed doesn't work
	$scope.$watch('room.date', function (newVal, oldVal) {
		if (!oldVal || newVal == oldVal) return;

		setStartAndEnd(self.date);

		// getMessages() will be triggered by this
		//$location.search({date: startDate});
		$state.go('roomHistory', {roomId: self.roomId, date: startDate});
	});

	setStartAndEnd($stateParams.date);
	getMessages();

	function getMessages() {
		bunkerData.getHistoryMessages(self.roomId, startDate, endDate)
			.then(function(messages) {
				self.ready = true;
				self.rawMessages = messages;
				_.each(messages, function (message) {
					addMessage(message);
					if (message.author) {
						self.members[message.author.id] = message.author;
					}
				});

				if (self.message) {
					// scroll to message
					$timeout(function () {
						$location.hash(self.message);
						$anchorScroll();
					}, 1000);
				}
			});
	}

	function addMessage(message) {
		var lastMessage = _.last(self.messages);
		message.$firstInSeries = !lastMessage || !lastMessage.author || !message.author || lastMessage.author.id != message.author.id;
		self.messages.push(message);
	}

	function setStartAndEnd(date) {
		startDate = moment(date).format('YYYY-MM-DD');
		endDate = moment(date).add(1, 'days').format('YYYY-MM-DD');
		self.date = moment(date).toDate();
	}

	this.openCalendar = function ($event) {
		$event.preventDefault();
		$event.stopPropagation();

		self.calendarOpened = true;
	};

	this.dateOptions = {
		formatYear: 'yy',
		startingDay: 1
	};

	this.format = 'yyyy-MM-dd';
});
