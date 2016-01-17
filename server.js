const restify = require('restify');
const ActivitiesEndpoint = require('./activities/ActivitiesEndpoint.js');

const server = restify.createServer();

server.use(restify.CORS());

server.use(restify.bodyParser({ mapParams: false }));

server.get(/\/app\/?.*/, restify.serveStatic({
	directory: __dirname
}));

new ActivitiesEndpoint(server);

server.listen(1024);
