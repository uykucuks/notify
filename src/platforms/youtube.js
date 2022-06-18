const EventEmitter = require('events');
const WebSocket = require('ws');
const axios = require('axios');
const parser = new (require("rss-parser"))();
const fs = require('fs');

module.exports = class LivecordYoutube extends EventEmitter {
    constructor({ postedVideos = [], channels, interval = 60000 }) {
        super();

        if (!postedVideos) throw new Error('LivecordYoutube: postedVideos is required');
        if (!Array.isArray(postedVideos)) throw new Error('LivecordYoutube: postedVideos must be an array');
        if (interval && typeof interval !== 'number') throw new Error('LivecordYoutube: interval must be a number');
        if (!channels) throw new Error('LivecordYoutube: You must provide a list of channels.');
        if (!Array.isArray(channels)) throw new Error('LivecordYoutube: channels must be an array');

        try {
            this.ws = new WebSocket(`wss://demo.piesocket.com/v3/channel_1?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self`);
        } catch {
            const err = new Error('Failed to connect Livecord, please try again later.');
            err.name = 'Livecord';
            throw err;
        };
        this.channels = channels;
        this.postedVideos = postedVideos;
        global.this = this;

        this.ws.on('open', () => {
            JSON.parse(fs.readFileSync('videos.json')).forEach(video => {
                if(!this.postedVideos.includes(video)) this.postedVideos.push(video);
            });
            this.emit('ready', Date.now());
            setInterval(() => {
                channels.forEach(async channel => {
                    parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel}`)
                        .then(data => {
                            let $ = data.items[0];
                            if(postedVideos.includes($.id)) return;
                            if(!fs.existsSync('videos.json')) {
                                fs.writeFileSync('videos.json', JSON.stringify([$.id]));
                            } else {
                                fs.writeFileSync('videos.json', JSON.stringify([
                                    ...JSON.parse(fs.readFileSync('videos.json')),
                                    $.id
                                ]));
                            }
                            this.postedVideos.push($.id);
                            return this.emit('upload', $);
                        }).catch(() => {});
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