app.controller('RoomHistoryController', function ($scope, bunkerApi, currentUser, $stateParams, $state) {
	var self = this;
	this.roomId = $stateParams.roomId;
	this.currentUser = currentUser;

	var startDate;
	var endDate;

	this.messages = [];
	this.date; //need this for binding WHY?!!!!!!!!!!
	this.members = {};

	this.subDay = function () {
		self.date = moment(self.date).add(-1,'days').toDate();
	};

	this.addDay = function () {
		self.date = moment(self.date).add(1,'days').toDate();
	};

	// hack :-( ng-changed doesn't work
	$scope.$watch('room.date', function (newVal, oldVal) {
		if(!oldVal || newVal == oldVal) return;

		setStartAndEnd(self.date);

		// getMessages() will be triggered by this
		//$location.search({date: startDate});
		$state.go('roomHistory', {roomId: self.roomId, date: startDate});
	});

	setStartAndEnd($stateParams.date);
	getMessages();

	function getMessages(){
		var query = { roomId: self.roomId, startDate: startDate, endDate: endDate};
		self.rawMessages = bunkerApi.history.query(query, function (messages) {
			_(messages).each(function (message) {
				addMessage(message);
				self.members[message.author.id] = message.author;
			});
		});
	}

	function addMessage(message) {
		var lastMessage = _.last(self.messages);
		message.$firstInSeries = !lastMessage || !lastMessage.author || !message.author || lastMessage.author.id != message.author.id;
		self.messages.push(message);
	}

	function setStartAndEnd(date){
		startDate = moment(date).format('YYYY-MM-DD');
		endDate = moment(date).add(1, 'days').format('YYYY-MM-DD');
		self.date = moment(date).toDate();
	}

	this.openCalendar = function($event) {
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
