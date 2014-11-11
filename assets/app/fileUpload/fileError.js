app.controller('FileError', function (errorMessage, $modalInstance) {
	this.error = errorMessage;

	this.close = function () {
		$modalInstance.dismiss('close');
	};
});