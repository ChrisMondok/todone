const r = require('rethinkdb');
const config = require('config');

function Endpoint() {
	throw new Error("Endpoint is \"abstract\".");
}

Endpoint.prototype.respondWithPromise = function(promiseFactory) { //how delightfully enterprisey
	var self = this;
	return function(request, response, next) {
		return self.getConnection(request).then(function(connection) {
			return promiseFactory.call(self, request, connection);
		}).then(function(data) {
			response.send(data);
			return next();
		}, function(error) {
			return next(error);
		});
	};
};

Endpoint.prototype.getConnection = function(request, callback) {
	//TODO: per-user database?
	return r.connect(config.get('database'));
};

module.exports = Endpoint;
