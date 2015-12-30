(function (app) {

	app.ChatComponent = ng.core
		.Component({
			selector: 'chat',
			templateUrl: '/assets/app2/chat/chat.html',
			viewProviders: [BunkerData],
			directives: [app.LobbyComponent]
		})
		.Class({
			constructor: [BunkerData, function (bunkerData) {
				bunkerData.init();
			}]
		});

})(window.app);
