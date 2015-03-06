// override the angular-bootstrap datepicker directive due to changes in angular 1.3
app.directive('datepickerPopup', function (dateFilter, datepickerPopupConfig) {
	return {
		restrict: 'A',
		priority: 1,
		require: 'ngModel',
		link: function (scope, element, attr, ngModel) {
			var dateFormat = attr.datepickerPopup || datepickerPopupConfig.datepickerPopup;
			ngModel.$formatters.push(function (value) {
				return dateFilter(value, dateFormat);
			});
		}
	};
});

