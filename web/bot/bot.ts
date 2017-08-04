import config = require('./config');
import { HarvardArtMuseums } from './HarvardClientLib';
import * as request from 'request';

//Prague imports
import { UniversalChat, WebChatConnector, IChatMessageMatch } from 'prague-botframework';
import { BrowserBot } from 'prague-botframework-browserbot';
import { Router, first, best, ifMatch, run, simpleRouter, routeMessage, IStateMatch } from 'prague';
type B = IChatMessageMatch & IStateMatch<any>;
import { matchRE, ifMatchRE } from 'prague';
import { LuisModel } from 'prague';
import { RootDialogInstance, DialogInstance, Dialogs } from 'prague'
import { Scheduler } from 'rxjs';

declare global {
    interface Window { browserBot: any; }
}

export module BotLogic {

    enum ClientEvents {
        Refresh3DPaintings,
        LaunchTextToSpeech,
        LaunchSpeechToText,
        RequestSelected3DPainting,
        PaintingInfo
    }

    var searchName: string = config.azuresearch.searchName; // Name of search
    var indexName: string = config.azuresearch.indexname;  // name of the second index build on Hardward data
    var searchKey: string = config.azuresearch.searchKey;  // Need to place this into Azure
    var queryString: string = config.azuresearch.searchquery;  //the query API template

    export class Bot {
        private rootDialogInstance: DialogInstance;
        private harvardClient: HarvardArtMuseums.Client;
        private webChat: WebChatConnector;
        private browserBot: BrowserBot<{}>;
        private router: Router<B>;

        /**
         *
         */
        constructor() {
            this.initializeForWeb();
        }

        public initializeForWeb() {
            //Todo stuff for web if still needed
            this.webChat = new WebChatConnector();
            window["browserBot"] = this.webChat.botConnection;
            this.browserBot = new BrowserBot<{}>(new UniversalChat(this.webChat.chatConnector), {});
            this.init();
        }

        public initializeForConsole() {
            //Todo stuff to run in console ()
            this.init();
        }

        private init() {
            const url = config.luis.url;
            this.harvardClient = new HarvardArtMuseums.Client();

            this.setupRules();

            this.browserBot.message$
                .observeOn(Scheduler.async)
                .flatMap(m => routeMessage(this.router, m as any))
                .subscribe(
                    message => console.log("handled", message),
                    error => console.log("error", error),
                    () => console.log("complete")
                );

            console.log('Binding dialogs to intents...');
            this.setupRules();

            console.log('Initialize backchannel...');
            this.initBackChannel();
        }

        // Build the message for the Azure Search. Added the new 2017 API syntax which adds the API Key into the header
        private searchQueryStringBuilder(query: string): any {
            var sendMessage = {
                url: `${queryString}&${query}`,
                headers: {
                    'api-key': `${searchKey}`
                }
            }
            return (sendMessage);
        }

        // Azure Seach Helper funtion which makes the correct call to Azure search and sends response to the function call back
        private performSearchQuery(queryString: any, callback: any) {
            request(queryString, function (error: any, response: any, body: any) {
                if (!error && response && response.statusCode == 200) {
                    var result = JSON.parse(body);
                    callback(null, result);
                } else {
                    callback(error, null);
                }
            });
        }

        // Set up all the Dialog Routes
        private registerDialogs() {
            // this.bot.on('conversationUpdate', (message) => {
            //     if (message.membersAdded) {
            //         message.membersAdded.forEach((identity: any) => {
            //             if (identity.id === message.address.bot.id) {
            //                 var reply = new builder.Message()
            //                     .address(message.address)
            //                     .text("Hello! I am the art bot. You can say: 'what did picasso paint?'");
            //                 this.bot.send(reply);
            //                 // need to push to prompt for dialog
            //             }
            //         });
            //     }
            // });

            // this.bot.dialog('/promptArtist', [
            //     (session) => {
            //         var choices = ["Artist", "Era"]
            //         builder.Prompts.choice(session, "How would you like to explore the gallery?", choices);
            //     },
            //     (session, results) => {
            //         if (results.response) {
            //             var selection = results.response.entity;
            //             // route to corresponding dialogs

            //             switch (selection) {
            //                 case "Artist":
            //                     session.replaceDialog('/ArtistList');
            //                     break;
            //                 case "Era": // Needs to be added to code
            //                     session.replaceDialog('/ArtistEra');
            //                     break;
            //                 default:
            //                     session.reset('/');
            //                     break;
            //             }
            //         }
            //     }
            // ]);

            // this.bot.dialog('/sendPaintingInfo', (session) => {
            //     this.sendEvent(session, ClientEvents.RequestSelected3DPainting);
            // });

            // this.bot.dialog('/ArtistList', [
            //     (session) => {

            //         //Uses Azure Search to find all the artists that are contained within the Harvard API
            //         var queryString: any = this.searchQueryStringBuilder('facet=people');

            //         // Perform the query and if succesful search for all the search.facets that are returned and place in an Array
            //         this.performSearchQuery(queryString, function (err: any, result: any) {
            //             if (err) {
            //                 console.log("Error when finding all the Artists:" + err);
            //             } else if (result && result['@search.facets'] && result['@search.facets'].people) {
            //                 var artists = result['@search.facets'].people;
            //                 var ArtistNames: any = [];

            //                 //Pushes the name of each Artist into an array
            //                 artists.forEach(function (artist: any, i: any) {
            //                     ArtistNames.push(artist['value'] + " (" + artist.count + ")");
            //                 });

            //                 //Prompts the user to select the Artist he/she is interested in
            //                 builder.Prompts.choice(session, "Which painter are you interested in?", ArtistNames);
            //             } else {
            //                 session.endDialog("I couldn't find the Artist");
            //             }
            //         });
            //     }, (session, results) => {
            //         //Chooses just the Artist name - parsing out the count
            //         var artistName = results.response.entity.split(' (')[0];;
            //         this.sendPaintings(session, artistName);
            //     }
            // ]);

            // this.bot.dialog("/artist", (session, args) => {
            //     if (!args.entities) {
            //         session.endDialog("I did not understand :)");
            //         return;
            //     }

            //     let Artist = builder.EntityRecognizer.findEntity(args.entities, 'Artist');

            //     if (!Artist) {
            //         session.endDialog("I did not understand the artist you are looking for :)");
            //     }
            //     else {
            //         this.sendPaintings(session, Artist.entity);
            //     }
            // });
        }

        //message handlers
        private artistInfoHandler() {

        }

        private setupRules() {
            // this.dialog.matches(/What am I looking at\?/i, '/sendPaintingInfo');
            // this.dialog.matches(/What is this\?/i, '/sendPaintingInfo');
            // this.dialog.matches('artist', '/artist');
            // this.dialog.matches('listartists', '/promptArtist');

            this.router = first(
                ifMatch(matchRE(/I am (.*)/i), m => m.reply(`Nice to meet you, ${m.groups[1]}.`)),
                ifMatch(matchRE(/Hello|Hi|Wassup/i), m => m.reply("Hello, World")),
                m => m.reply("I didn't catch that.")
            )
        }

        private initBackChannel() {
            // this.bot.on("message", (message) => {

            // });

            // this.bot.on("event", (message) => {
            //     if (message.name === ClientEvents[ClientEvents.PaintingInfo]) {
            //         var textToSend;
            //         let address = message.address;
            //         if (message.value) {
            //             let painting = <harvard.HarvardArtMuseums.Painting>message.value;
            //             textToSend = `This painting is named: **${painting.title}**, and was created by: **${painting.people.name}**`;
            //         }
            //         else {
            //             textToSend = "You are not looking directly at any painting.";
            //         }
            //         delete address.conversationId;
            //         let msg = new builder.Message()
            //             .address(address)
            //             .text(textToSend);
            //         this.bot.send(msg);
            //     }
            // });
        }

        private sendEvent(session: any, eventType: ClientEvents, value?: any) {
            // var msg: any = new builder.Message();
            // msg.data.type = "event";
            // msg.data.name = ClientEvents[eventType];
            // msg.data.value = value;
            // session.send(msg);
        }

        // private sendPaintings(session: builder.Session, artistName: string) {
        //     this.harvardClient.searchFor(artistName, (results) => {
        //         let heroCardList: builder.AttachmentType[] = [];

        //         results.forEach((painting) => {
        //             painting.image.iiifbaseuri = painting.image.iiifbaseuri + "/full/pct:20/0/native.jpg";
        //             heroCardList.push(this.createHeroCard(session, painting));
        //         });

        //         let msg;
        //         if (heroCardList.length > 0) {
        //             msg = new builder.Message(session).attachments(heroCardList);
        //             msg.attachmentLayout(builder.AttachmentLayout.carousel);
        //         }
        //         else {
        //             msg = 'I did not find anything';
        //         }

        //         session.endDialog(msg);

        //         if (results.length > 0) {
        //             this.sendEvent(session, ClientEvents.Refresh3DPaintings, results);
        //         }
        //     });
        // }

        // private createHeroCard(session: builder.Session, painting: harvard.HarvardArtMuseums.Painting): builder.HeroCard {
        //     return new builder.HeroCard(session)
        //         .title(painting.title)
        //         .subtitle(painting.people.name)
        //         .text(painting.description)
        //         .images([
        //             builder.CardImage.create(session, painting.image.iiifbaseuri)
        //         ])
        //         .buttons([
        //             builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework', 'Get Started')
        //         ]);
        // }
    }
}