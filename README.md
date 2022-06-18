# [@livecord/notify](https://npmjs.com/package/@livecord/notify)
[Do you need my help? Visit our Discord server.](https://livecord.me/discord)

![NPM Downloads](https://img.shields.io/npm/dm/@livecord/notifyt?style=for-the-badge)
![License](https://img.shields.io/npm/l/@livecord/notify?style=for-the-badge)
```bash
Node Version: 16.15.0
```

### Installation
```bash
npm i @livecord/notify --save
# or
yarn add @livecord/notify
```

## Twitch

```js
const { Twitch } = require('@livecord/notify');
const twitch = new Twitch({ 
    client: {
        id: 'YOUR_CLIENT_ID', // Your client ID
        token: 'YOUR_TOKEN_HERE', // https://dev.twitch.tv/docs/authentication/getting-tokens
    },
    channels: [ 'clqu_' ], // Array of channels (required)
    interval: 60000 // check channels every (optional) (default: 60000 [60 seconds])
});

twitch.on('ready', (ready) => {
    console.log('Twitch connected at: ', ready);
});

twitch.on('live', channel => {
    console.log(channel.user_name + " is live!");
});

twitch.on('offline', channel => {
    console.log(channel.user_name + " is offline!");
});
```

#### How to get Twitch Token?
```js
const { Twitch } = require('@livecord/notify');

Twitch.getToken("CLIENT_ID", "CLIENT_SECRET").then(token => {
    console.log(token);
}).catch(err => {
    console.log(err);
})
```

## Youtube

```js
const { YouTube } = require('@livecord/notify');
const youtube = new YouTube({
    channels: [ '' ], // Array of channel ids (required)
    interval: 1000 // check channels every 1000ms (1 second) (optional) (default: 60000 [60 seconds])]) 
});

youtube.on('ready', (ready) => {
    console.log('Youtube connected at: ', ready);
});

youtube.on('upload', video => {
    console.log('Youtube new video!', video);
})
```

---
<h6 align="center">Developed with ❤️ by Livecord</h6>