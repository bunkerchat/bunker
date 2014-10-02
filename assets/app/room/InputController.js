app.controller('InputController', function ($stateParams, bunkerApi) {
	this.messageText = '';
	this.sendMessage = function () {
		if (!this.messageText) return;

		var newMessage = new bunkerApi.message();
		newMessage.room = $stateParams.roomId;
		newMessage.text = this.messageText;
		newMessage.$save();
		this.messageText = '';
	};
});
