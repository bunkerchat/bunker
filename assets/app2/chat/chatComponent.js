(function (app) {

	function ChatComponent() {

	}

	ChatComponent.annotations = [
		new ng.ComponentAnnotation({
			selector: 'chat',
			appInjector: [BunkerData]
		}),
		new ng.ViewAnnotation({
			templateUrl: '/assets/app2/chat/chat.html',
		})
	];

	ChatComponent.parameters = [[BunkerData]];

})(window.app);
