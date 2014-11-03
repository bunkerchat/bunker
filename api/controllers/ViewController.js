module.exports = {
	index: function (req, res) {
		res.view('index', {
			userId: req.session.user.id
		});
	},
	login: function (req, res) {
		res.view('login');
	}
};
