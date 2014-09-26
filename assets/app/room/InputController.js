app.controller('InputController', function(bunkerApi) {
    this.messageText = '';
    this.sendMessage = function() {
        var newMessage = new bunkerApi.message();
        newMessage.text = this.messageText;
        newMessage.$save();
        this.messageText = '';
    };
});