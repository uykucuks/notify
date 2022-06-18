const EventEmitter = require('events');
const WebSocket = require('ws');
const axios = require('axios');

module.exports = class LivecordTwitch extends EventEmitter {
    constructor({ client, channels, interval = 60000 }) {
        super();

        if (!client) throw new Error('LivecordTwitch: client is required');
        if (!client.id) throw new Error('LivecordTwitch: client.id is required');
        if (!client.token) throw new Error('LivecordTwitch: client.token is required');
        if (typeof client !== 'object') throw new Error('LivecordTwitch: client must be an object');
        if (typeof client.id !== 'string') throw new Error('LivecordTwitch: client.id must be a string');
        if (typeof client.token !== 'string') throw new Error('LivecordTwitch: client.token must be a string');
        if (interval && typeof interval !== 'number') throw new Error('LivecordTwitch: interval must be a number');
        if (!channels) throw new Error('LivecordTwitch: You must provide a list of channels.');
        if (!Array.isArray(channels)) throw new Error('LivecordTwitch: channels must be an array');

        try {
              this.ws = new WebSocket(`wss://demo.piesocket.com/v3/channel_1?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self`);
        } catch {
              const err = new Error('Failed to connect Livecord, please try again later.');
              err.name = 'Livecord';
              throw err;
        };
        this.channels = channels;
        this.lives = [];
        this.ws.on('open', () => {
            this.emit('ready', Date.now());
            setInterval(() => {
                channels.forEach(async channel => {
                    const request = await axios.request({
                        method: "GET",
                        url: `https://api.twitch.tv/helix/streams?user_login=${channel}`,
                        headers: { 
                            "client-id": client.id, 
                            "Authorization": `Bearer ${client.token}` 
                        }
                    }).then(res => res.data).catch(err => err.response);
                    let isLive = request.data[0];
                    let findLive = this.lives.find(element => element.user_login === channel);
                    if(isLive && isLive.type === 'live') {
                        if(findLive) return;
                        this.lives.push(isLive);
                        return this.emit('live', isLive);
                    } else {
                        if(findLive) {
                            this.emit('offline', findLive);
                            return this.lives.splice(this.lives.indexOf(findLive), 1);
                        }
                    }
                })
            }, interval || 60000);
        });

        this.ws.on('close', () => {
              const error = new Error('Connection closed');
              error.name = 'Livecord';
              this.emit('close', error);
        });
    };
};

module.exports.getToken = async (clientId, clientSecret) => {
    const request = await axios.post('https://id.twitch.tv/oauth2/token', {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
    }).then(res => res.data).catch(err => {
        throw new Error(err);
    });
    return request;
};