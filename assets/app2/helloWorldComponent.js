(function () {
	app.HelloWorldComponent = ng.core.Component({
		selector: 'hello-world',
		template: '<h1>Hi!</h1>'
	})
		.Class({
			constructor: function () {
			}
		});
})();