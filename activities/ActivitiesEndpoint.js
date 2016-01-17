const restify = require('restify');
const config = require('config');
const r = require('rethinkdb');
const Activity = require('./Activity.js');
const util = require('util');

function ActivitiesEndpoint(server) {

	server.get('/api/activities', this.respondWithPromise(this.getAll));
	server.post('/api/activities', this.respondWithPromise(this.post));
	server.get(/^\/api\/activities\/(\d{4}-\d{2}-\d{2})$/, this.respondWithPromise(this.findByDate));
	server.get('/api/activities/:id', this.respondWithPromise(this.getById));
	server.put('/api/activities/:id', this.respondWithPromise(this.put));
	server.del('/api/activities/:id', this.respondWithPromise(this.del));
}

util.inherits(ActivitiesEndpoint, require('../Endpoint.js'));

ActivitiesEndpoint.prototype.getAll = function(request, connection) {
	return r.table('activities')
		.orderBy({index: 'date'})
		.run(connection)
		.then(function(cursor) {
			return cursor.toArray();
		}).then(function(rawActivities) {
			return rawActivities.map(function(json) {
				return new Activity(json);
			});
		});
};

ActivitiesEndpoint.prototype.getById = function(request, connection) {
	return r.table('activities')
		.get(request.params.id)
		.run(connection)
		.then(function(activity) {
		if(!activity)
			throw new restify.NotFoundError("There is no activity with the id "+request.params.id);
		return new Activity(activity);
	});
};

ActivitiesEndpoint.prototype.post = function(request, connection) {
	if(request.body.id)
		throw new Error("Can't post with id.");
	var activity = new Activity(request.body);
	return this.storeAndReturnActivity(connection, activity);
};

ActivitiesEndpoint.prototype.put = function(request, connection) {
	request.body.id = request.params.id;
	var activity = new Activity(request.body);
	return this.storeAndReturnActivity(connection, activity);
};

ActivitiesEndpoint.prototype.findByDate = function(request, connection) {
	var date = request.params[0];

	return r.table('activities').filter({date: date}).run(connection)
		.then(function(cursor) {
			return cursor.toArray();
		}).then(function(data) {
			return data.map(function(item) {
				return new Activity(item);
			});
		});
};

ActivitiesEndpoint.prototype.del = function(request, connection) {
	return r.table('activities').get(request.params.id)['delete']().run(connection)
		.then(function(result) {
			if(!result.deleted)
				throw new restify.NotFoundError("There is no activity with the id "+request.params.id);
			return 204;
		});
};

ActivitiesEndpoint.prototype.storeAndReturnActivity = function(connection, activity) {
	return r.table('activities').insert(activity).run(connection)
		.then(function(result) {
			if(result.generated_keys && result.generated_keys.length)
				activity.id = result.generated_keys[0];
			return activity;
	});
};

module.exports = ActivitiesEndpoint;
