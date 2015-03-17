module.exports = {
	index: function (req, res) {
		res.view('index', {
			userId: req.session.userId,
			isProduction: sails.config.environment === 'production'
		});
	},
	react: function (req, res) {
		res.view('react', {
			userId: req.session.userId,
			isProduction: sails.config.environment === 'production'
		});
	},
	login: function (req, res) {
		res.view('login');
	}
};
