    declare var global: any;

const config = {
    bot: {
        //David key
        // app: process.env.BOT_APP_ID || '345dffb4-150e-47de-a291-3eaf5cc30014',
        // key: process.env.BOT_KEY || 'w5dBTaxppdV41NMQ8nLozEz'

        //Config for the BOT
        app: process.env.BOT_APP_ID || '',
        key: process.env.BOT_KEY || ''

        //Pierlag
        //pp: process.env.BOT_APP_ID || '42b9242e-7541-4b76-9183-6ff1ebab977f',
        //key: process.env.BOT_KEY || 'XpJww6n3KguRCA2aqtmHX9w'
    },
    luis: {
        app: process.env.LUIS_APP || '',
        key: process.env.LUIS_KEY || '',
        url: process.env.LUIS_URL || ''
    },
    azuresearch: {
        searchName: process.env.SEARCHNAME || '',
        indexname: process.env.SEARCHINDEX || '',
        searchKey: process.env.SEARCHKEY || '',
        searchquery: process.env.SEARCHQUERY || ''
    },
    webServer: {
        port: process.env.WEB_SERVER_PORT || process.env.PORT || 3978
    }
};


export = config;

module.exports = function () {

}