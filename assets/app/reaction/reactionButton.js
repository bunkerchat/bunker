app.component('reactionButton', {
	bindings: {
		messageId: '@'
	},
	template: `<i class="fa fa-smile-o" ng-click="$ctrl.reactionSelector()"></i>`,
	controller: function (bunkerData) {
		this.reactionSelector = () => {
			bunkerData.reactionMenuMessageId = this.messageId;
		};
	}
});
