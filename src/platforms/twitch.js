const EventEmitter = require('events');
const WebSocket = require('ws');
const axios = require('axios');
const fs = require('fs');

module.exports = class LivecordTwitch extends EventEmitter {
    constructor({ client, interval = 60000, useDatabase = true }) {
        super();

        if (!client) throw new Error('LivecordTwitch: client is required');
        if (!client.id) throw new Error('LivecordTwitch: client.id is required');
        if (!client.token) throw new Error('LivecordTwitch: client.token is required');
        if (typeof client !== 'object') throw new Error('LivecordTwitch: client must be an object');
        if (typeof client.id !== 'string') throw new Error('LivecordTwitch: client.id must be a string');
        if (typeof client.token !== 'string') throw new Error('LivecordTwitch: client.token must be a string');
        if (interval && typeof interval !== 'number') throw new Error('LivecordTwitch: interval must be a number');
        if (useDatabase && typeof useDatabase !== 'boolean') throw new Error('LivecordTwitch: useDatabase must be a boolean');

        try {
              this.ws = new WebSocket(`wss://demo.piesocket.com/v3/channel_1?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self`);
        } catch {
              const err = new Error('Failed to connect Livecord, please try again later.');
              err.name = 'Livecord';
              throw err;
        };
        this.channels = [];
        this.lives = [];
        this.client = client;
        this.useDatabase = useDatabase;
        if (useDatabase) {
            if (fs.existsSync('./livecord-twitch.json')) {
                let db = JSON.parse(fs.readFileSync('livecord-twitch.json'));
                db?.channels?.forEach(channel => {
                    if (!this.channels.find(el => el.user_login === channel?.toLowerCase())) this.channels.push(channel);
                });
                db?.lives?.forEach(channel => {
                    if (!this.lives.find(el => el.user_login === channel?.user_login?.toLowerCase())) this.lives.push(channel);
                });
            } else {
                fs.writeFileSync('livecord-twitch.json', JSON.stringify({ lives: [], channels: [] }, null, 2));
            }
        }
        this.ws.on('open', () => {
            this.emit('ready', Date.now());
            setInterval(() => {
                this.channels.forEach(async channel => {
                    const request = await axios.request({
                        method: "GET",
                        url: `https://api.twitch.tv/helix/streams?user_login=${channel}`,
                        headers: { 
                            "client-id": client.id, 
                            "Authorization": `Bearer ${client.token}` 
                        }
                    }).then(res => res.data).catch(err => err.response);
                    let isLive = request.data[0];
                    let findLive = this.lives.find(element => element.user_login === channel?.toLowerCase());
                    let db = JSON.parse(fs.readFileSync('livecord-twitch.json'))?.lives;
                    if(isLive && isLive.type === 'live') {
                        if(db.find(element => element.user_login === isLive?.user_login?.toLowerCase())) return;
                        if(findLive) return;
                        this.lives.push(isLive);
                        fs.writeFileSync('livecord-twitch.json', JSON.stringify({
                            lives: [
                                ...JSON.parse(fs.readFileSync('livecord-twitch.json'))?.lives,
                                isLive
                            ],
                            channels: [
                                ...JSON.parse(fs.readFileSync('livecord-twitch.json'))?.channels,
                            ],
                        }, null, 2));
                        return this.emit('live', isLive);
                    } else {
                        if(db.find(element => element.user_login === findLive?.user_login?.toLowerCase())) {
                            fs.writeFileSync('livecord-twitch.json', JSON.stringify({
                                lives: [
                                    ...JSON.parse(fs.readFileSync('livecord-twitch.json'))?.lives?.filter(element => element.user_login !== findLive?.user_login?.toLowerCase()),
                                ],
                                channels: [
                                    ...JSON.parse(fs.readFileSync('livecord-twitch.json'))?.channels,
                                ],
                            }, null, 2));
                        }
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
    follow(channel) {
        if (!channel) throw new Error('LivecordTwitch: channel is required');
        if (typeof channel === 'string') {
            if (this.channels.includes(channel?.toLowerCase())) return;
            if (this.useDatabase) {
                fs.writeFileSync('livecord-twitch.json', JSON.stringify({
                    lives: [
                        ...JSON.parse(fs.readFileSync('livecord-twitch.json'))?.lives
                    ],
                    channels: [
                        ...JSON.parse(fs.readFileSync('livecord-twitch.json'))?.channels,
                        channel?.toLowerCase()
                    ],
                }, null, 2));
                return this.channels.push(channel?.toLowerCase());
            } else {
                return this.channels.push(channel?.toLowerCase());
            }
        } else if (Array.isArray(channel)) {
            channel.forEach(c => {
                if (this.channels.includes(c?.toLowerCase())) return;
                if (this.useDatabase) {
                    fs.writeFileSync('livecord-twitch.json', JSON.stringify({
                        lives: [
                            ...JSON.parse(fs.readFileSync('livecord-twitch.json'))?.lives
                        ],
                        channels: [
                            ...JSON.parse(fs.readFileSync('livecord-twitch.json'))?.channels,
                            c?.toLowerCase()
                        ],
                    }, null, 2));
                    return this.channels.push(c?.toLowerCase());
                } else {
                    return this.channels.push(c?.toLowerCase());
                }
            })
        } else {
            throw new Error('LivecordTwitch: channel must be a string or array');
        }
    }
    unfollow(channel) {
        if (!channel) throw new Error('LivecordTwitch: channel is required');
        if (typeof channel === 'string') {
            if (!this.channels.includes(channel?.toLowerCase())) return;
            if (this.useDatabase) {
                this.channels = this.channels.filter(el => el !== channel?.toLowerCase());
                return fs.writeFileSync('livecord-twitch.json', JSON.stringify({
                    lives: [
                        ...JSON.parse(fs.readFileSync('livecord-twitch.json'))?.lives
                    ],
                    channels: [
                        ...JSON.parse(fs.readFileSync('livecord-twitch.json'))?.channels?.filter(el => el !== channel?.toLowerCase())
                    ],
                }, null, 2));
            } else {
                return this.channels = this.channels.filter(el => el !== channel?.toLowerCase());
            }
        } else if (Array.isArray(channel?.toLowerCase())) {
            channel.forEach(c => {
                if (!this.channels.includes(c?.toLowerCase())) return;
                if (this.useDatabase) {
                    this.channels = this.channels.filter(el => el !== c?.toLowerCase());
                    return fs.writeFileSync('livecord-twitch.json', JSON.stringify({
                        lives: [
                            ...JSON.parse(fs.readFileSync('livecord-twitch.json'))?.lives
                        ],
                        channels: [
                            ...JSON.parse(fs.readFileSync('livecord-twitch.json'))?.channels?.filter(el => el !== c?.toLowerCase())
                        ],
                    }, null, 2));
                } else {
                    return this.channels = this.channels.filter(el => el !== c?.toLowerCase());
                }
            })
        } else {
            throw new Error('LivecordTwitch: channel must be a string or array');
        }
    }
    async getUser(userId) {
        if (!userId) throw new Error('LivecordTwitch: userId is required');
        if (typeof userId === 'string') {
            const request = await axios.request({
                method: "GET",
                url: `https://api.twitch.tv/helix/users?id=${userId}`,
                headers: { 
                    "client-id": this.client.id, 
                    "Authorization": `Bearer ${this.client.token}` 
                }
            }).then(res => res.data).catch(err => err.response);
            return request?.data[0];
        } else {
            throw new Error('LivecordTwitch: userId must be a string');
        }
    }
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