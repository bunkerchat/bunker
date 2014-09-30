app.controller('InputController', function($stateParams, bunkerApi) {
    this.messageText = '';
    this.sendMessage = function() {
        var newMessage = new bunkerApi.message();
		newMessage.roomId = $stateParams.roomId;
        newMessage.text = this.messageText;
        newMessage.$save();
        this.messageText = '';
    };
});