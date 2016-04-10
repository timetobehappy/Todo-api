module.exports = function(db) {
	return {
		requireAuthentication: function(req, res, next) {
			var token = req.get('Auth');

			console.log('Token is '+ token);

			db.user.findByToken(token).then(function(user) {
					req.user = user;
					console.log('In requireAuthentication user is ' + user)
					next();
				},
				function(e) {
					console.log("In error requireAuthentication");
					res.status(401).send();
				});
		}

	};
}