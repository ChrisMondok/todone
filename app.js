var restify = require('restify');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('database', 'username', 'password', {
	dialect: 'sqlite',
	storage: 'database.db'
});

var ActivitiesEndpoint = require('./ActivitiesEndpoint.js');

var server = restify.createServer();

var appContext = {
	server: server,
	sequelize: sequelize
};

server.use(restify.bodyParser({ mapParams: false }));

new ActivitiesEndpoint(appContext);

server.listen(8080);
