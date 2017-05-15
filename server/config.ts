
const config = {
    bot: {
        app: process.env.BOT_APP_ID,
        key: process.env.BOT_KEY
    },
    luis: {
        app: process.env.LUIS_APP || '',
        key: process.env.LUIS_KEY || '',
        url: process.env.LUIS_URL || 'https://api.projectoxford.ai/luis/v2.0/apps/##APP##?subscription-key=##KEY##&verbose=true'
    },
    webServer: {
        port: process.env.WEB_SERVER_PORT || 3978
    }
};

export = config;