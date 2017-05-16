"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const Bot = require("./server/bot");
const config = require("./server/config");
const bot = new Bot();
bot.initializeForWeb();
console.log('Configuring web server...');
const server = restify.createServer();
server.post('/api/messages', bot.connector.listen());
server.listen(config.webServer.port, () => {
    console.log('The bot server is now running on port %s and is ready to recieve requests', config.webServer.port);
});
server.get(/\/web\/?.*/, restify.serveStatic({
    directory: __dirname
}));
