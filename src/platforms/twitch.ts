import { Live, Client } from '../interfaces';
import EventEmitter from 'events';
import axios from 'axios';
import fs from 'fs';

export class LivecordTwitch extends EventEmitter {
    public channels: string[] = [];
    public lives: Live[] = [];
    public client: Client;
    public useDatabase: boolean;

    constructor({ client, interval = 60000, useDatabase = true }: { client: Client, interval: number, useDatabase: boolean }) {
        super();
        if (!client) throw new Error('LivecordTwitch: client is required');
        if (!client.id) throw new Error('LivecordTwitch: client.id is required');
        if (!client.token) throw new Error('LivecordTwitch: client.token is required');
        if (typeof client !== 'object') throw new Error('LivecordTwitch: client must be an object');
        if (typeof client.id !== 'string') throw new Error('LivecordTwitch: client.id must be a string');
        if (typeof client.token !== 'string') throw new Error('LivecordTwitch: client.token must be a string');
        if (interval && typeof interval !== 'number') throw new Error('LivecordTwitch: interval must be a number');
        if (useDatabase && typeof useDatabase !== 'boolean') throw new Error('LivecordTwitch: useDatabase must be a boolean');

        this.client = client;
        this.useDatabase = useDatabase;

        if (useDatabase) {
            if (fs.existsSync('./livecord-twitch.json')) {
                let db = JSON.parse(fs.readFileSync('livecord-twitch.json').toString());

                (db?.channels || []).forEach((channel: string) => {
                    if (!this.channels.find(el => el.toLowerCase() === channel?.toLowerCase())) this.channels.push(channel);
                });

                (db?.lives || []).forEach((channel: Live) => {
                    if (!this.lives.find(el => el.user_login.toLowerCase() === channel?.user_login?.toLowerCase())) this.lives.push(channel);
                });
            } else {
                fs.writeFileSync('livecord-twitch.json', JSON.stringify({ lives: [], channels: [] }, null, 2));
            };
        }
        
        setTimeout(() => {
            this.emit('ready', Date.now());
        }, 50);

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
                let findLive = this.lives.find(element => element.user_login.toLowerCase() === channel?.toLowerCase());
                let db: Live[] = JSON.parse(fs.readFileSync('livecord-twitch.json').toString())?.lives;

                if (isLive && isLive.type === 'live') {
                    if (db.find((element: Live) => element.user_login.toLowerCase() === isLive?.user_login?.toLowerCase())) return;
                    if (findLive) return;
                    this.lives.push(isLive);

                    fs.writeFileSync('livecord-twitch.json', JSON.stringify({
                        lives: [
                            ...JSON.parse(fs.readFileSync('livecord-twitch.json').toString())?.lives,
                            isLive
                        ],
                        channels: [
                            ...JSON.parse(fs.readFileSync('livecord-twitch.json').toString())?.channels,
                        ],
                    }, null, 2));

                    return this.emit('live', isLive);
                } else {
                    if (db.find((element: Live) => element.user_login.toLowerCase() === findLive?.user_login?.toLowerCase())) {
                        fs.writeFileSync('livecord-twitch.json', JSON.stringify({
                            lives: [
                                ...JSON.parse(fs.readFileSync('livecord-twitch.json').toString())?.lives?.filter((element: Live) => element.user_login.toLowerCase() !== findLive?.user_login?.toLowerCase()),
                            ],
                            channels: [
                                ...JSON.parse(fs.readFileSync('livecord-twitch.json').toString())?.channels,
                            ],
                        }, null, 2));
                    };
                    if (findLive) {
                        this.emit('offline', findLive);
                        return this.lives.splice(this.lives.indexOf(findLive), 1);
                    };
                };
            });
        }, interval || 60000);
    };

    follow(channel: string | string[]) {
        if (!channel) throw new Error('LivecordTwitch: channel is required');

        if (typeof channel === 'string') {
            if (this.channels.includes(channel?.toLowerCase())) return;
            if (this.useDatabase) {
                fs.writeFileSync('livecord-twitch.json', JSON.stringify({
                    lives: [
                        ...JSON.parse(fs.readFileSync('livecord-twitch.json').toString())?.lives
                    ],
                    channels: [
                        ...JSON.parse(fs.readFileSync('livecord-twitch.json').toString())?.channels,
                        channel?.toLowerCase()
                    ],
                }, null, 2));

                return this.channels.push(channel?.toLowerCase());
            } else {
                return this.channels.push(channel?.toLowerCase());
            };
        } else if (Array.isArray(channel)) {
            channel.forEach(c => {
                if (this.channels.includes(c?.toLowerCase())) return;

                if (this.useDatabase) {
                    fs.writeFileSync('livecord-twitch.json', JSON.stringify({
                        lives: [
                            ...JSON.parse(fs.readFileSync('livecord-twitch.json').toString())?.lives
                        ],
                        channels: [
                            ...JSON.parse(fs.readFileSync('livecord-twitch.json').toString())?.channels,
                            c?.toLowerCase()
                        ],
                    }, null, 2));

                    return this.channels.push(c?.toLowerCase());
                } else {
                    return this.channels.push(c?.toLowerCase());
                };
            });
        } else {
            throw new Error('LivecordTwitch: channel must be a string or array');
        };
    };

    unfollow(channel: string | string[]) {
        if (!channel) throw new Error('LivecordTwitch: channel is required');

        if (typeof channel === 'string') {
            if (!this.channels.includes(channel?.toLowerCase())) return;
            if (this.useDatabase) {
                this.channels = this.channels.filter(el => el !== channel?.toLowerCase());
                
                return fs.writeFileSync('livecord-twitch.json', JSON.stringify({
                    lives: [
                        ...JSON.parse(fs.readFileSync('livecord-twitch.json').toString())?.lives
                    ],
                    channels: [
                        ...JSON.parse(fs.readFileSync('livecord-twitch.json').toString())?.channels?.filter((el: string) => el !== channel?.toLowerCase())
                    ],
                }, null, 2));
            } else {
                return this.channels = this.channels.filter(el => el !== channel?.toLowerCase());
            };
        } else if (Array.isArray(channel)) {
            channel.forEach(c => {
                if (!this.channels.includes(c?.toLowerCase())) return;
                if (this.useDatabase) {
                    this.channels = this.channels.filter(el => el !== c?.toLowerCase());

                    return fs.writeFileSync('livecord-twitch.json', JSON.stringify({
                        lives: [
                            ...JSON.parse(fs.readFileSync('livecord-twitch.json').toString())?.lives
                        ],
                        channels: [
                            ...JSON.parse(fs.readFileSync('livecord-twitch.json').toString())?.channels?.filter((el: string) => el !== c?.toLowerCase())
                        ],
                    }, null, 2));
                } else {
                    return this.channels = this.channels.filter(el => el !== c?.toLowerCase());
                };
            });
        } else {
            throw new Error('LivecordTwitch: channel must be a string or array');
        };
    };

    async getUser(userLogin: string) {
        if (!userLogin) throw new Error('LivecordTwitch: userLogin is required');

        if (typeof userLogin === 'string') {
            const request = await axios.request({
                method: "GET",
                url: `https://api.twitch.tv/helix/users?login=${userLogin}`,
                headers: { 
                    "client-id": this.client.id, 
                    "Authorization": `Bearer ${this.client.token}` 
                }
            }).then(res => res.data).catch(err => err.response);

            return request?.data[0];
        } else {
            throw new Error('LivecordTwitch: userLogin must be a string');
        };
    };

    async getLive(userLogin: string) {
        if (!userLogin) throw new Error('LivecordTwitch: userLogin is required');

        if (typeof userLogin === 'string') {
            const request = await axios.request({
                method: "GET",
                url: `https://api.twitch.tv/helix/streams?user_login=${userLogin}`,
                headers: { 
                    "client-id": this.client.id, 
                    "Authorization": `Bearer ${this.client.token}` 
                }
            }).then(res => res.data).catch(err => err.response);

            return request?.data[0] ? { isLive: true, ...request?.data[0] } : { isLive: false };
        } else {
            throw new Error('LivecordTwitch: userLogin must be a string');
        };
    };
    static async getToken(clientId: string, clientSecret: string) {
        const request = await axios.post('https://id.twitch.tv/oauth2/token', {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials',
        }).catch(err => {
            return err.response;
        });
    
        return request?.data || 'Request failed.';
    };
};