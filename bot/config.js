const config = {
    bot: {
        app: process.env.BOT_APP_ID || '',
        key: process.env.BOT_KEY || ''
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
module.exports = function () {
};
