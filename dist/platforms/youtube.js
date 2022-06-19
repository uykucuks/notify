"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LivecordYoutube = void 0;
const events_1 = __importDefault(require("events"));
const rss_parser_1 = __importDefault(require("rss-parser"));
const fs_1 = __importDefault(require("fs"));
const parser = new rss_parser_1.default();
class LivecordYoutube extends events_1.default {
    channels = [];
    postedVideos;
    useDatabase;
    constructor({ postedVideos = [], interval = 60000, useDatabase = true }) {
        super();
        if (!postedVideos)
            throw new Error('LivecordYoutube: postedVideos is required');
        if (!Array.isArray(postedVideos))
            throw new Error('LivecordYoutube: postedVideos must be an array');
        if (interval && typeof interval !== 'number')
            throw new Error('LivecordYoutube: interval must be a number');
        if (useDatabase && typeof useDatabase !== 'boolean')
            throw new Error('LivecordYoutube: useDatabase must be a boolean');
        this.postedVideos = postedVideos;
        this.useDatabase = useDatabase;
        if (useDatabase) {
            if (fs_1.default.existsSync('./livecord-youtube.json')) {
                let db = JSON.parse(fs_1.default.readFileSync('livecord-youtube.json').toString());
                (db?.videos || []).forEach((video) => {
                    if (!this.postedVideos.includes(video))
                        this.postedVideos.push(video);
                });
                (db?.channels || []).forEach((channel) => {
                    if (!this.channels.includes(channel))
                        this.channels.push(channel);
                });
            }
            else {
                fs_1.default.writeFileSync('livecord-youtube.json', JSON.stringify({ videos: [], channels: [] }, null, 2));
            }
            ;
        }
        ;
        setTimeout(() => {
            this.emit('ready', Date.now());
        }, 50);
        setInterval(() => {
            this.channels.forEach(async (channel) => {
                parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel}`)
                    .then(data => {
                    let $ = data.items[0];
                    if (useDatabase) {
                        if (postedVideos.includes($.id))
                            return;
                        fs_1.default.writeFileSync('livecord-youtube.json', JSON.stringify({
                            videos: [
                                ...JSON.parse(fs_1.default.readFileSync('livecord-youtube.json').toString())?.videos,
                                $.id
                            ],
                            channels: [
                                ...JSON.parse(fs_1.default.readFileSync('livecord-youtube.json').toString())?.channels
                            ]
                        }, null, 2));
                        this.postedVideos.push($.id);
                        return this.emit('upload', $);
                    }
                    else {
                        return this.emit('upload', $);
                    }
                    ;
                }).catch(() => { });
            });
        }, interval || 60000);
    }
    ;
    subscribe(channel) {
        if (!channel)
            throw new Error('LivecordYoutube: channel is required');
        if (typeof channel === 'string') {
            if (this.channels.includes(channel))
                return;
            if (this.useDatabase) {
                fs_1.default.writeFileSync('livecord-youtube.json', JSON.stringify({
                    videos: [
                        ...JSON.parse(fs_1.default.readFileSync('livecord-youtube.json').toString())?.videos,
                    ],
                    channels: [
                        ...JSON.parse(fs_1.default.readFileSync('livecord-youtube.json').toString())?.channels,
                        channel
                    ]
                }, null, 2));
                this.channels.push(channel);
                return this.emit('newChannel', channel);
            }
            else {
                this.channels.push(channel);
                return this.emit('newChannel', channel);
            }
            ;
        }
        else if (Array.isArray(channel)) {
            channel.forEach(c => {
                if (this.channels.includes(c))
                    return;
                if (this.useDatabase) {
                    fs_1.default.writeFileSync('livecord-youtube.json', JSON.stringify({
                        videos: [
                            ...JSON.parse(fs_1.default.readFileSync('livecord-youtube.json').toString())?.videos,
                        ],
                        channels: [
                            ...JSON.parse(fs_1.default.readFileSync('livecord-youtube.json').toString())?.channels,
                            c
                        ]
                    }, null, 2));
                    return this.channels.push(c);
                }
                else {
                    return this.channels.push(c);
                }
                ;
            });
        }
        else {
            throw new Error('LivecordYoutube: channel must be a string or array');
        }
        ;
    }
    ;
    unsubscribe(channel) {
        if (!channel)
            throw new Error('LivecordYoutube: channel is required');
        if (typeof channel === 'string') {
            if (!this.channels.includes(channel))
                return;
            if (this.useDatabase) {
                this.channels = this.channels.filter(el => el !== channel);
                return fs_1.default.writeFileSync('livecord-youtube.json', JSON.stringify({
                    videos: [
                        ...JSON.parse(fs_1.default.readFileSync('livecord-youtube.json').toString())?.videos,
                    ],
                    channels: [
                        ...JSON.parse(fs_1.default.readFileSync('livecord-youtube.json').toString())?.channels?.filter((el) => el !== channel)
                    ]
                }, null, 2));
            }
            else {
                return this.channels = this.channels.filter(el => el !== channel);
            }
            ;
        }
        else if (Array.isArray(channel)) {
            channel.forEach(c => {
                if (!this.channels.includes(c))
                    return;
                if (this.useDatabase) {
                    this.channels = this.channels.filter(el => el !== c);
                    return fs_1.default.writeFileSync('livecord-youtube.json', JSON.stringify({
                        videos: [
                            ...JSON.parse(fs_1.default.readFileSync('livecord-youtube.json').toString())?.videos,
                        ],
                        channels: [
                            ...JSON.parse(fs_1.default.readFileSync('livecord-youtube.json').toString())?.channels?.filter((el) => el !== c)
                        ]
                    }));
                }
                else {
                    return this.channels = this.channels.filter(el => el !== c);
                }
                ;
            });
        }
        else {
            throw new Error('LivecordYoutube: channel must be a string or array');
        }
        ;
    }
    ;
}
exports.LivecordYoutube = LivecordYoutube;
;
