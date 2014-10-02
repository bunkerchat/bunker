module.exports = {
	index: function (request, response) {
		response.view('index');
	},
	login: function (request, response) {
		response.view('login');
	}
};
