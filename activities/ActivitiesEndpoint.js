const restify = require('restify');
const config = require('config');
const r = require('rethinkdb');
const Activity = require('./Activity.js');

function ActivitiesEndpoint(server) {

	server.get('/api/activities', this.getAll.bind(this));
	server.post('/api/activities', this.post.bind(this));
	server.get(/^\/api\/activities\/(\d{4}-\d{2}-\d{2})$/, this.findByDate.bind(this));
	server.get('/api/activities/:id', this.getById.bind(this));
	server.put('/api/activities/:id', this.put.bind(this));
	server.del('/api/activities/:id', this.del.bind(this));
}

ActivitiesEndpoint.prototype.getConnection = function(request, callback) {
	//TODO: per-user database?
	return r.connect(config.get('database'));
};

ActivitiesEndpoint.prototype.getAll = function(request, response, next) {
	return this.getConnection(request).then(function(connection) {
		return r.table('activities').run(connection);
	}).then(function(cursor) {
		return cursor.toArray();
	}).then(function(rawActivities) {
		return rawActivities.map(function(json) {
			return new Activity(json);
		});
	}).then(function(activities) {
		response.send(activities);
		return next();
	}, function(err) {
		return next(err);
	});
};

ActivitiesEndpoint.prototype.getById = function(request, response, next) {
	return this.getConnection(request).then(function(connection) {
		return r.table('activities').get(request.params.id).run(connection);
	}).then(function(activity) {
		if(!activity)
			response.send(404);
		else
			response.send(new Activity(activity));
		return next();
	});
};

ActivitiesEndpoint.prototype.post = function(request, response, next) {
	if(request.body.id)
		throw new Error("Can't post with id.");
	var activity = new Activity(request.body);
	return this.storeAndReturnActivity(request, activity).then(function(activity) {
		response.send(activity);
		return next();
	});
};

ActivitiesEndpoint.prototype.put = function(request, response, next) {
	request.body.id = request.params.id;
	var activity = new Activity(request.body);
	return this.storeAndReturnActivity(request, activity).then(function(activity) {
		response.send(activity);
		return next();
	});
};

ActivitiesEndpoint.prototype.findByDate = function(request, response, next) {
	var date = request.params[0];
	return this.getConnection(request).then(function(connection) {
		return r.table('activities').filter({date: date}).run(connection);
	}).then(function(cursor) {
		return cursor.toArray();
	}).then(function(data) {
		return data.map(function(item) {
			return new Activity(item);
		});
	}).then(function(activities) {
		response.send(activities);
		next();
	});
};

ActivitiesEndpoint.prototype.del = function(request, response, next) {
	return this.getConnection(request).then(function(connection) {
		return r.table('activities').get(request.params.id)['delete']().run(connection);
	}).then(function(result) {
		if(result.deleted)
			response.send(204);
		else
			response.send(404);
		return next();
	});
};

ActivitiesEndpoint.prototype.storeAndReturnActivity = function(request, activity) {
	return this.getConnection(request).then(function(connection) {
		return r.table('activities').insert(activity).run(connection);
	}).then(function(result) {
		if(result.generated_keys && result.generated_keys.length)
			activity.id = result.generated_keys[0];
		return activity;
	});
};

module.exports = ActivitiesEndpoint;
