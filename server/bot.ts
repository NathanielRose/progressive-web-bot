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
        this.bot.dialog("/artist", (session,args) => {
            var Artist = builder.EntityRecognizer.findEntity(args.entities, 'Artist');
            this.send3DEvent(session);
        })

        this.dialog.matches('artist', '/artist'); 
    }

    private initBackChannel() {
        this.bot.on("message", (message) => {
            
        });

        this.bot.on("event", function (message) {
            if (message.name === "myCustomEvent") {
            }
        });
    }

    private send3DEvent (session:any) {
        if(session.message.text === "3D"){
                var msg:any = new builder.Message();     
                msg.data.type = "event";
                msg.data.name = "launch3D";
                msg.data.value = "Cause 3D rocks.";
                session.send(msg);
            }
    }

    private init() {
        this.bot = new builder.UniversalBot(this.connector);
        const url = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/8204e650-feb0-471d-ab15-2813c0a33447?subscription-key=252d60e7d01c4236a6a7e77d03c558ff&timezoneOffset=0&verbose=true&q="
        this.recognizer = new builder.LuisRecognizer(url);
        this.dialog = new builder.IntentDialog({ recognizers: [this.recognizer] });

        console.log('Initialize defaults...');
        this.dialog.onDefault((session, message) => {
            
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