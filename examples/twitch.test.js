const { Twitch } = require('../src/index');
const twitch = new Twitch({ 
    client: {
        id: 'YOUR_CLIENT_ID', // Your client ID
        token: 'YOUR_TOKEN_HERE', // https://dev.twitch.tv/docs/authentication/getting-tokens
    },
    channels: [ 'loirenn', 'clqu_' ], // Array of channels (required)
    interval: 1000 // check channels every 1000ms (1 second) (optional) (default: 60000 [60 seconds])]) 
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