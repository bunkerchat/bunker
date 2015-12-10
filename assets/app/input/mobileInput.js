app.component('mobileInput', {
	bindings: {
		messageText: '='
	},
	templateUrl: '/assets/app/input/mobile-input.html',
	controller: function ($rootScope, bunkerData) {

		var self = this;

		this.sendMessage = function () {
			if (self.messageText && self.messageText.replace(/\s/g, '').length > 0) {
				bunkerData.createMessage($rootScope.roomId, self.messageText);
			}

			delete self.messageText;
		};
	}
});
