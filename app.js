const restify = require('restify');
const ActivitiesEndpoint = require('./activities/ActivitiesEndpoint.js');

const server = restify.createServer();

server.use(restify.bodyParser({ mapParams: false }));

new ActivitiesEndpoint(server);

server.listen(1024);
