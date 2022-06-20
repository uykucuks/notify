import { Twitch } from '../src';

const twitch = new Twitch({
	client: {
		id: "",
		token: ""
	},
	useDatabase: true,
	interval: 1000
});

twitch.follow([
	'elraenn'
]);

twitch.on('ready', (ready) => {
	twitch.getUser('elraenn').then(user => {
		twitch.getFollowers(user.id).then(followers => {
			console.log(followers.total);
		})
		twitch.getFollows(user.id).then(followers => {
			console.log(followers.total);
		})
	})
	twitch.getLive('elraenn').then(user => {
		console.log(user);
	})
    console.log('Twitch connected at: ', ready);
});

twitch.on('live', channel => {
    console.log(channel)
    console.log(channel.user_name + " is live!");
});

twitch.on('offline', channel => {
    console.log(channel.user_name + " is offline!");
});