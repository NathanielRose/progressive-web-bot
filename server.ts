import restify = require('restify');
import builder = require('botbuilder');

import Bot = require('./server/bot');
import config = require('./server/config');

const bot = new Bot();
bot.initializeForWeb();

console.log('Configuring web server...');
const server = restify.createServer();

server.post('/api/messages', (<builder.ChatConnector>bot.connector).listen());
server.listen(config.webServer.port, () => {
    console.log('The bot server is now running on port %s and is ready to recieve requests', config.webServer.port);
});

//we use this to serve the webchat webpage 
server.get(/\/web\/?.*/, restify.serveStatic({
    directory: __dirname
}));