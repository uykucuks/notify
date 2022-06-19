const EventEmitter = require('events');
const WebSocket = require('ws');
const axios = require('axios');
const parser = new (require("rss-parser"))();
const fs = require('fs');

module.exports = class LivecordYoutube extends EventEmitter {
    constructor({ postedVideos = [], interval = 60000, useDatabase = true }) {
        super();

        if (!postedVideos) throw new Error('LivecordYoutube: postedVideos is required');
        if (!Array.isArray(postedVideos)) throw new Error('LivecordYoutube: postedVideos must be an array');
        if (interval && typeof interval !== 'number') throw new Error('LivecordYoutube: interval must be a number');
        if (useDatabase && typeof useDatabase !== 'boolean') throw new Error('LivecordYoutube: useDatabase must be a boolean');

        try {
            this.ws = new WebSocket(`wss://demo.piesocket.com/v3/channel_1?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self`);
        } catch {
            const err = new Error('Failed to connect Livecord, please try again later.');
            err.name = 'Livecord';
            throw err;
        };
        this.channels = [];
        this.postedVideos = postedVideos;
        this.useDatabase = useDatabase;
        global.this = this;
        if (useDatabase) {
            if (fs.existsSync('./livecord-youtube.json')) {
                let db = JSON.parse(fs.readFileSync('livecord-youtube.json'));
                db?.videos?.forEach(video => {
                    if (!this.postedVideos.includes(video)) this.postedVideos.push(video);
                });
                db?.channels?.forEach(channel => {
                    if (!this.channels.includes(channel)) this.channels.push(channel);
                });
            } else {
                fs.writeFileSync('livecord-youtube.json', JSON.stringify({ videos: [], channels: [] }, null, 2));
            }
        }
        this.ws.on('open', () => {
            this.emit('ready', Date.now());
            setInterval(() => {
                this.channels.forEach(async channel => {
                    parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel}`)
                        .then(data => {
                            let $ = data.items[0];
                            if (useDatabase) {
                                if (postedVideos.includes($.id)) return;
                                fs.writeFileSync('livecord-youtube.json', JSON.stringify({
                                    videos: [
                                        ...JSON.parse(fs.readFileSync('livecord-youtube.json'))?.videos,
                                        $.id
                                    ],
                                    channels: [
                                        ...JSON.parse(fs.readFileSync('livecord-youtube.json'))?.channels
                                    ]
                                }, null, 2));
                                this.postedVideos.push($.id);
                                return this.emit('upload', $);
                            } else {
                                return this.emit('upload', $);
                            }
                        }).catch(() => { });
                })
            }, interval || 60000);
        });

        this.ws.on('close', () => {
            const error = new Error('Connection closed');
            error.name = 'Livecord';
            this.emit('close', error);
        });
    };
    subscribe(channel) {
        if (!channel) throw new Error('LivecordYoutube: channel is required');
        if (typeof channel === 'string') {
            if (this.channels.includes(channel)) return;
            if (this.useDatabase) {
                fs.writeFileSync('livecord-youtube.json', JSON.stringify({
                    videos: [
                        ...JSON.parse(fs.readFileSync('livecord-youtube.json'))?.videos,
                    ],
                    channels: [
                        ...JSON.parse(fs.readFileSync('livecord-youtube.json'))?.channels,
                        channel
                    ]
                }, null, 2));
                this.channels.push(channel);
                return this.ws.emit('newChannel', channel);
            } else {
                this.channels.push(channel);
                return this.ws.emit('newChannel', channel);
            }
        } else if (Array.isArray(channel)) {
            channel.forEach(c => {
                if (this.channels.includes(c)) return;
                if (this.useDatabase) {
                    fs.writeFileSync('livecord-youtube.json', JSON.stringify({
                        videos: [
                            ...JSON.parse(fs.readFileSync('livecord-youtube.json'))?.videos,
                        ],
                        channels: [
                            ...JSON.parse(fs.readFileSync('livecord-youtube.json'))?.channels,
                            c
                        ]
                    }, null, 2));
                    return this.channels.push(c);
                } else {
                    return this.channels.push(c);
                }
            })
        } else {
            throw new Error('LivecordYoutube: channel must be a string or array');
        }
    }
    unsubscribe(channel) {
        if (!channel) throw new Error('LivecordYoutube: channel is required');
        if (typeof channel === 'string') {
            if (!this.channels.includes(channel)) return;
            if (this.useDatabase) {
                this.channels = this.channels.filter(el => el !== channel);
                return fs.writeFileSync('livecord-youtube.json', JSON.stringify({
                    videos: [
                        ...JSON.parse(fs.readFileSync('livecord-youtube.json'))?.videos,
                    ],
                    channels: [
                        ...JSON.parse(fs.readFileSync('livecord-youtube.json'))?.channels?.filter(el => el !== channel)
                    ]
                }, null, 2));
            } else {
                return this.channels = this.channels.filter(el => el !== channel);
            }
        } else if (Array.isArray(channel)) {
            channel.forEach(c => {
                if (!this.channels.includes(c)) return;
                if (this.useDatabase) {
                    this.channels = this.channels.filter(el => el !== c);
                    return fs.writeFileSync('livecord-youtube.json', JSON.stringify({
                        videos: [
                            ...JSON.parse(fs.readFileSync('livecord-youtube.json'))?.videos,
                        ],
                        channels: [
                            ...JSON.parse(fs.readFileSync('livecord-youtube.json'))?.channels?.filter(el => el !== c)
                        ]
                    }));
                } else {
                    return this.channels = this.channels.filter(el => el !== c);
                }
            })
        } else {
            throw new Error('LivecordYoutube: channel must be a string or array');
        }
    }
};