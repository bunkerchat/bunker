function BunkerData() {
	var socket = io();

	socket.emitAsync = function (endpoint, _data) {
		var data = _.isObject(_data) ? _data : undefined;
		return new Promise(function (resolve, reject) {
			socket.emit(endpoint, data, function (returnData) {
				if (returnData && returnData.serverErrorMessage) {
					console.error(returnData.serverErrorMessage, {
						endpoint: endpoint,
						data: data,
						returnData: returnData
					});
					return reject(returnData);
				}
				resolve(returnData);
			});
		});
	};

	this.init = function () {
		socket.emitAsync('/init').then(function (data) {
			console.log('init worked!', data);
		});
	};
}
