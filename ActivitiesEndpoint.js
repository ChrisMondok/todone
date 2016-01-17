var Sequelize = require('sequelize');
var restify = require('restify');

function ActivitiesEndpoint(appContext) {

	appContext.server.get('/api/activities/', this.getAll.bind(this));
	appContext.server.get(/^\/api\/activities\/(\d{4}-\d{2}-\d{2})$/, this.findByDate.bind(this));
	appContext.server.get('/api/activities/:id', this.getById.bind(this));
	appContext.server.post('/api/activities', this.post.bind(this));
	appContext.server.put('/api/activities/:id', this.put.bind(this));
	appContext.server.del('/api/activities/:id', this.del.bind(this));

	this.createModel(appContext.sequelize);
}

ActivitiesEndpoint.prototype.getAll = function(request, response, next) {
	return this.Activity.findAll().then(function(activities) {
		response.send(activities);
		next();
	}, next);
};

ActivitiesEndpoint.prototype.getById = function(request, response, next) {
	return this.Activity.find({
		where: {id: request.params.id}
	}).then(function(activity) {
		if(!activity)
			response.send(404);
		else
			response.send(activity);
	}, next);
};

ActivitiesEndpoint.prototype.post = function(request, response, next) {
	this.Activity.create(request.body).then(function(activity) {
		response.send(activity.toJSON());
		return next();
	}, function(error) {
		return next(new restify.BadRequestError(error.message));
	});
};

ActivitiesEndpoint.prototype.findByDate = function(request, response, next) {
	var date = request.params[0];
	this.Activity.findAll({
		where: {
			date: date
		}
	}).then(function(activities) {
		response.send(activities);
	}, next);
	return next();
};

ActivitiesEndpoint.prototype.del = function(request, response, next) {
	return this.Activity.destroy({
		where: {id: request.params.id}
	}).then(function(r) {
		response.send(r ? 204 : 404);
		next();
	}, next);
};

ActivitiesEndpoint.prototype.put = function(request, response, next) {
	var activity = request.body;
	activity.id = request.params.id;
	return this.Activity.upsert(activity).then(function(activity) {
		response.send(activity);
		next();
	}, next);
};

ActivitiesEndpoint.prototype.createModel = function(sequelize) {
	this.Activity = sequelize.define('activity', {
		date: {
			type: Sequelize.DATEONLY,
			allowNull: false,
			defaultValue: null,
			validate: {
				is: /^\d{4}-\d{2}-\d{2}$/
			}
		},
		time: {
			type: Sequelize.TIME,
			allowNull: false,
			defaultValue: null,
			validate: {
				is: {
					args: /^\d{2}:\d{2}$/,
					msg: 'Time must be of the format HH:MM'
				}
			}
		},
		name: {
			type: Sequelize.STRING(160),
			allowNull: false,
			defaultValue: null
		}
	}, {timestamps: false});

	this.Activity.sync().then(function() {
		console.log("Activity table sync'd.");
	});
};

ActivitiesEndpoint.prototype.Activity = null;

module.exports = ActivitiesEndpoint;
