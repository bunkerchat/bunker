(function (app) {

	app.ChatComponent = ng.core
		.Component({
			selector: 'chat',
			templateUrl: '/assets/app2/chat/chat.html',
			viewProviders: [BunkerData]
		})
		.Class({
			constructor: [BunkerData, function (bunkerData) {
				bunkerData.init();
			}]
		});

})(window.app);
