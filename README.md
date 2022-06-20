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
// ESM
//import { Twitch } from '@livecord/notify'; 

// CJS
const { Twitch } = require("@livecord/notify");

const twitch = new Twitch({ 
    client: {
        id: "YOUR_CLIENT_ID", // Your client ID
        token: "YOUR_TOKEN_HERE", // https://dev.twitch.tv/docs/authentication/getting-tokens
    },
    interval: 60000 // check channels every (optional) (default: 60000 [60 seconds])
});

twitch.on("ready", (ready) => {
    twitch.follow([ "clqu_" ]);
    twitch.unfollow([ "clqu_" ]);

    console.log("Twitch connected at: ", ready);
});

twitch.on("live", channel => {
    console.log(channel.user_name + " is live!");
});

twitch.on("offline", channel => {
    console.log(channel.user_name + " is offline!");
});

// Other Functions
// twitch.getUser('user_login_name');
// twitch.getLive('user_login_name');
```

#### How to get Twitch Token?
```js
// ESM
//import { Twitch } from '@livecord/notify'; 

// CJS
const { Twitch } = require("@livecord/notify");

Twitch.getToken("CLIENT_ID", "CLIENT_SECRET").then(token => {
    console.log(token);
}).catch(err => {
    console.log(err);
})
```
#### Data of Channel
```json
{
    "id": "",
    "user_id": "",
    "user_login": "",
    "user_name": "",
    "game_id": "",
    "game_name": "",
    "type": "live",
    "title": "",
    "viewer_count": 0,
    "started_at": "",
    "language": "",
    "thumbnail_url": "",
    "tag_ids": [ "" ],
    "is_mature": true
}
```

## Youtube

```js
// ESM
//import { YouTube } from '@livecord/notify'; 

// CJS
const { YouTube } = require("@livecord/notify");

const youtube = new YouTube({
    interval: 60000, // check channels every 1000ms (1 second) (optional) (default: 60000 [60 seconds])]) 
    useDatabase: true // use database to store videos (optional) (default: true)
});

youtube.on("ready", (ready) => {
    youtube.subscribe("UC00_j4mtyaMbWX62JWBMmWA"); // Subscribe to a another channel
    // For multiple: youtube.subscribe(["", ""]);

    youtube.unsubscribe("UC00_j4mtyaMbWX62JWBMmWA"); // Unsubscribe to any added channels
    // For multiple: youtube.unsubscribe(["", ""]);

    console.log("Youtube connected at: ", ready);
});

youtube.on("upload", video => {
    console.log("Youtube new video!", video);
})
```
#### Data of Video
```json
{
  "title": "",
  "link": "",
  "pubDate": "",
  "author": "",
  "id": "",
  "isoDate": ""
}
```
---
<h6 align="center">Developed with ❤️ by Livecord</h6>