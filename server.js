"use strict";
exports.__esModule = true;
var restify = require("restify");
var Bot = require("./server/bot");
var config = require("./server/config");
var bot = new Bot();
bot.initializeForWeb();
console.log('Configuring web server...');
var server = restify.createServer();
server.post('/api/messages', bot.connector.listen());
server.listen(config.webServer.port, function () {
    console.log('The bot server is now running on port %s and is ready to recieve requests', config.webServer.port);
});
server.get(/\/web\/?.*/, restify.serveStatic({
    directory: __dirname
}));
//# sourceMappingURL=server.js.map