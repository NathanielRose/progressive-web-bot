import builder = require('botbuilder');
import config = require('./config');

class Bot {
    public connector: builder.ConsoleConnector | builder.ChatConnector;
    private bot: builder.UniversalBot;
    private recognizer: builder.LuisRecognizer;
    private dialog: builder.IntentDialog;

    public initializeForWeb() {
        if (!config.bot.key) {
            this.connector = new builder.ChatConnector();
            console.log('WARNING: Starting bot without ID or Secret');
        } else {
            this.connector = new builder.ChatConnector({ appId: config.bot.app, appPassword: config.bot.key });
            console.log('Bot started with App Id %s', config.bot.app);
        }
        this.init();
    }

    public initializeForConsole() {
        this.connector = new builder.ConsoleConnector();
        this.init();
    }

    private registerDialogs() {
        this.bot.dialog('/', this.dialog);

        //here is a classic way of greeting a new user and explaining how things work
        this.bot.on('conversationUpdate', (message) => {
            if (message.membersAdded) {
                message.membersAdded.forEach((identity:any) => {
                    if (identity.id === message.address.bot.id) {
                        var reply = new builder.Message()
                            .address(message.address)
                            .text("Helo! I am the art bot");
                        this.bot.send(reply);
                    }
                });
            }
        });
    }

    private bindDialogs() {
        this.dialog.matches('favoriteFood', '/food'); 
    }

    private initBackChannel() {
        this.bot.on("message", (message) => {
            
        });

        this.bot.on("event", function (message) {
            if (message.name === "myCustomEvent") {
            }
        });
    }

    private init() {
        this.bot = new builder.UniversalBot(this.connector);
        const url = config.luis.url.replace('##APP##', config.luis.app).replace('##KEY##', config.luis.key);
        this.recognizer = new builder.LuisRecognizer(url);
        this.dialog = new builder.IntentDialog({ recognizers: [this.recognizer] });

        console.log('Initialize defaults...');
        this.dialog.onDefault((session, message) => {
            if(session.message.text === "3D"){
                var msg:any = new builder.Message();     
                msg.data.type = "event";
                msg.data.name = "launch3D";
                msg.data.value = "Cause 3D rocks.";
                session.send(msg);
            }
        });

        console.log('Creating dialogs...');
        this.registerDialogs();

        console.log('Binding dialogs to intents...');
        this.bindDialogs();

        console.log('Initialize backchannel...');
        this.initBackChannel();
    }
}
export = Bot;