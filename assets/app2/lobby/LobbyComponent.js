(function (app) {

	app.LobbyComponent = ng.core
		.Component({
			selector: 'lobby'
		})
		.View({
			templateUrl: '/assets/app2/lobby/lobby.html',
			directives: [ng.common.NgFor]
		})
		.Class({
			constructor: [BunkerData, function (bunkerData) {
				this.rooms = bunkerData.rooms;
			}]
		});

})(window.app);
