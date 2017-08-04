import { HarvardArtMuseums } from './HarvardClientLib';
import * as request from 'request';
import { UniversalChat, WebChatConnector } from 'prague-botframework';
import { BrowserBot } from 'prague-botframework-browserbot';
var ClientEvents;
(function (ClientEvents) {
    ClientEvents[ClientEvents["Refresh3DPaintings"] = 0] = "Refresh3DPaintings";
    ClientEvents[ClientEvents["LaunchTextToSpeech"] = 1] = "LaunchTextToSpeech";
    ClientEvents[ClientEvents["LaunchSpeechToText"] = 2] = "LaunchSpeechToText";
    ClientEvents[ClientEvents["RequestSelected3DPainting"] = 3] = "RequestSelected3DPainting";
    ClientEvents[ClientEvents["PaintingInfo"] = 4] = "PaintingInfo";
})(ClientEvents || (ClientEvents = {}));
var searchName = config.azuresearch.searchName;
var indexName = config.azuresearch.indexname;
var searchKey = config.azuresearch.searchKey;
var queryString = config.azuresearch.searchquery;
var window;
class Bot {
    initializeForWeb() {
        window["browserBot"] = this.webChat.botConnection;
        this.webChat = new WebChatConnector();
        this.browserBot = new BrowserBot(new UniversalChat(this.webChat.chatConnector), {});
        this.init();
    }
    initializeForConsole() {
        this.init();
    }
    init() {
        const url = config.luis.url;
        this.harvardClient = new HarvardArtMuseums.Client();
        console.log('Binding dialogs to intents...');
        this.setupRules();
        console.log('Initialize backchannel...');
        this.initBackChannel();
    }
    searchQueryStringBuilder(query) {
        var sendMessage = {
            url: `${queryString}&${query}`,
            headers: {
                'api-key': `${searchKey}`
            }
        };
        return (sendMessage);
    }
    performSearchQuery(queryString, callback) {
        request(queryString, function (error, response, body) {
            if (!error && response && response.statusCode == 200) {
                var result = JSON.parse(body);
                callback(null, result);
            }
            else {
                callback(error, null);
            }
        });
    }
    registerDialogs() {
    }
    artistInfoHandler() {
    }
    setupRules() {
    }
    initBackChannel() {
    }
    sendEvent(session, eventType, value) {
    }
}
