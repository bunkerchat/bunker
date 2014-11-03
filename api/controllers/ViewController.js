module.exports = {
	index: function (req, res) {
		res.view('index', {
			userId: req.session.userId
		});
	},
	login: function (req, res) {
		res.view('login');
	}
};
