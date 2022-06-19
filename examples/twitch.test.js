const { Twitch } = require('../src/index');
const twitch = new Twitch({
    client: {
      id: "",
      token: ""
    },
    useDatabase: true,
    interval: 1000
  });

twitch.on('ready', (ready) => {
    console.log('Twitch connected at: ', ready);
});

twitch.on('live', channel => {
    console.log(channel)
    console.log(channel.user_name + " is live!");
});

twitch.on('offline', channel => {
    console.log(channel.user_name + " is offline!");
});