import EventEmitter from 'events';
import RssParser from 'rss-parser';
import fs from 'fs';
const parser = new RssParser();

export class LivecordYoutube extends EventEmitter {
    public channels: string[] = [];
    public postedVideos: string[];
    public useDatabase: boolean;

    constructor({ postedVideos = [], interval = 60000, useDatabase = true }: { postedVideos?: string[], interval: number, useDatabase: boolean }) {
        super();
        if (!postedVideos) throw new Error('LivecordYoutube: postedVideos is required');
        if (!Array.isArray(postedVideos)) throw new Error('LivecordYoutube: postedVideos must be an array');
        if (interval && typeof interval !== 'number') throw new Error('LivecordYoutube: interval must be a number');
        if (useDatabase && typeof useDatabase !== 'boolean') throw new Error('LivecordYoutube: useDatabase must be a boolean');

        this.postedVideos = postedVideos;
        this.useDatabase = useDatabase;

        if (useDatabase) {
            if (fs.existsSync('./livecord-youtube.json')) {
                let db = JSON.parse(fs.readFileSync('livecord-youtube.json').toString());

                (db?.videos || []).forEach((video: string) => {
                    if (!this.postedVideos.includes(video)) this.postedVideos.push(video);
                });
                (db?.channels || []).forEach((channel: string) => {
                    if (!this.channels.includes(channel)) this.channels.push(channel);
                });
            } else {
                fs.writeFileSync('livecord-youtube.json', JSON.stringify({ videos: [], channels: [] }, null, 2));
            };
        };

        setTimeout(() => {
            this.emit('ready', Date.now());
        }, 50);

        setInterval(() => {
            this.channels.forEach(async channel => {
                parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel}`)
                    .then(data => {
                        let $ = data.items[0];
                        if (useDatabase) {
                            if (postedVideos.includes($.id)) return;
                            fs.writeFileSync('livecord-youtube.json', JSON.stringify({
                                videos: [
                                    ...JSON.parse(fs.readFileSync('livecord-youtube.json').toString())?.videos,
                                    $.id
                                ],
                                channels: [
                                    ...JSON.parse(fs.readFileSync('livecord-youtube.json').toString())?.channels
                                ]
                            }, null, 2));

                            this.postedVideos.push($.id);
                            return this.emit('upload', $);
                        } else {
                            return this.emit('upload', $);
                        };
                    }).catch(() => {});
            });
        }, interval || 60000);
    };
    
    subscribe(channel: string | string[]) {
        if (!channel) throw new Error('LivecordYoutube: channel is required');
        if (typeof channel === 'string') {
            if (this.channels.includes(channel)) return;

            if (this.useDatabase) {
                fs.writeFileSync('livecord-youtube.json', JSON.stringify({
                    videos: [
                        ...JSON.parse(fs.readFileSync('livecord-youtube.json').toString())?.videos,
                    ],
                    channels: [
                        ...JSON.parse(fs.readFileSync('livecord-youtube.json').toString())?.channels,
                        channel
                    ]
                }, null, 2));

                this.channels.push(channel);
                return this.emit('newChannel', channel);
            } else {
                this.channels.push(channel);
                return this.emit('newChannel', channel);
            };
        } else if (Array.isArray(channel)) {
            channel.forEach(c => {
                if (this.channels.includes(c)) return;
                if (this.useDatabase) {
                    fs.writeFileSync('livecord-youtube.json', JSON.stringify({
                        videos: [
                            ...JSON.parse(fs.readFileSync('livecord-youtube.json').toString())?.videos,
                        ],
                        channels: [
                            ...JSON.parse(fs.readFileSync('livecord-youtube.json').toString())?.channels,
                            c
                        ]
                    }, null, 2));
                    return this.channels.push(c);
                } else {
                    return this.channels.push(c);
                };
            });
        } else {
            throw new Error('LivecordYoutube: channel must be a string or array');
        };
    };

    unsubscribe(channel: string | string[]) {
        if (!channel) throw new Error('LivecordYoutube: channel is required');
        if (typeof channel === 'string') {
            if (!this.channels.includes(channel)) return;
            if (this.useDatabase) {
                this.channels = this.channels.filter(el => el !== channel);
                return fs.writeFileSync('livecord-youtube.json', JSON.stringify({
                    videos: [
                        ...JSON.parse(fs.readFileSync('livecord-youtube.json').toString())?.videos,
                    ],
                    channels: [
                        ...JSON.parse(fs.readFileSync('livecord-youtube.json').toString())?.channels?.filter((el: string) => el !== channel)
                    ]
                }, null, 2));
            } else {
                return this.channels = this.channels.filter(el => el !== channel);
            };
        } else if (Array.isArray(channel)) {
            channel.forEach(c => {
                if (!this.channels.includes(c)) return;
                if (this.useDatabase) {
                    this.channels = this.channels.filter(el => el !== c);
                    return fs.writeFileSync('livecord-youtube.json', JSON.stringify({
                        videos: [
                            ...JSON.parse(fs.readFileSync('livecord-youtube.json').toString())?.videos,
                        ],
                        channels: [
                            ...JSON.parse(fs.readFileSync('livecord-youtube.json').toString())?.channels?.filter((el: string) => el !== c)
                        ]
                    }));
                } else {
                    return this.channels = this.channels.filter(el => el !== c);
                };
            });
        } else {
            throw new Error('LivecordYoutube: channel must be a string or array');
        };
    };
};