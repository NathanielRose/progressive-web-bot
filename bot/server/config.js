"use strict";
const config = {
    bot: {
        app: process.env.BOT_APP_ID || '42b9242e-7541-4b76-9183-6ff1ebab977f',
        key: process.env.BOT_KEY || 'XpJww6n3KguRCA2aqtmHX9w'
    },
    luis: {
        app: process.env.LUIS_APP || '',
        key: process.env.LUIS_KEY || '',
        url: process.env.LUIS_URL || 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/8204e650-feb0-471d-ab15-2813c0a33447?subscription-key=252d60e7d01c4236a6a7e77d03c558ff&timezoneOffset=0&verbose=true&q='
    },
    webServer: {
        port: process.env.WEB_SERVER_PORT || process.env.PORT || 3978
    }
};
module.exports = config;
//# sourceMappingURL=config.js.map