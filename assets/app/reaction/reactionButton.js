app.component('reactionButton', {
	bindings: {
		messageId: '@'
	},
	template: `<i class="fa fa-smile-o" ng-click="$ctrl.reactionSelector()"></i>`,
	controller: function ($rootScope) {
		this.reactionSelector = () => {
			$rootScope.$broadcast('reactionMenuOpen', this.messageId);
		};
	}
});
