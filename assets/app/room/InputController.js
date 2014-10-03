app.controller('InputController', function ($stateParams, bunkerApi) {
	this.messageText = '';
	this.submittedMessages = [];
	this.selectedMessageIndex = -1;

	this.sendMessage = function () {
		if (!this.messageText) return;

		var newMessage = new bunkerApi.message();
		newMessage.room = $stateParams.roomId;
		newMessage.text = this.messageText;
		newMessage.$save();

		this.submittedMessages.unshift(this.messageText);
		this.selectedMessageIndex = -1;
		this.messageText = '';
	};
	this.keyDown = function(evt) {
		if(evt.keyCode == 38 || evt.keyCode == 40) { // up or down
			this.selectedMessageIndex += evt.keyCode == 38 ? 1 : -1;

			if(this.selectedMessageIndex < 0) {
				this.selectedMessageIndex = 0;
			}
			else if(this.selectedMessageIndex >= this.submittedMessages.length) {
				this.selectedMessageIndex = this.submittedMessages.length-1;
			}

			this.messageText = this.submittedMessages[this.selectedMessageIndex];
		}
	};
});
