# Webchat with Push notifications

This is a sample of code which shows how you can enable push notifications on a web chat connected to the Microsoft Bot Framework. It is using service workers and Progressive Web Apps features.

[![Deploy to Azure](https://azuredeploy.net/deploybutton.png)](https://deploy.azure.com/?repository=https://github.com/NathanielRose/progressive-web-bot/tree/master?ptmpl=azuredeploy.parameters.json)

# How to try the sample
# How to try the sample
- clone this repository
- run ```npm install``` from command line
- run it with ```npm run build```.
- run `node server.js`.


- You will get a message where the port the server is running on. Use this to navigate to ` http://localhost:[serverport]/web/index.html`
    - deploying it online
    - making is publicly available from your computer using a tool like [ngrok](https://ngrok.com/)
    - modify the ```baseurl``` variable in the service-worker.js file with your public base url (https://something.xyz)
- create a bot at [http://dev.botframework.com](http://dev.botframework.com) using this public endpoint
- create environment variable to set your bot ```MICROSOFT_APP_ID``` and ```MICROSOFT_APP_PASSWORD``` secret keys
- activate the direct line channel on your bot and copy the key it gives you in the ```DIRECTLINE_SECRET``` constant in the index.js file
- redeploy if needed

You can now browse https://something.xyz/web/index.html and talk to the bot ! :)
