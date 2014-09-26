
module.exports = {
	index: function(request, response) {
		response.view('room');
	},
	login: function(request, response) {
		response.view('login');
	}
};