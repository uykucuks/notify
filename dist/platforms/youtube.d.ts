/// <reference types="node" />
import EventEmitter from 'events';
export declare class LivecordYoutube extends EventEmitter {
    channels: string[];
    postedVideos: string[];
    useDatabase: boolean;
    constructor({ postedVideos, interval, useDatabase }: {
        postedVideos?: string[];
        interval: number;
        useDatabase: boolean;
    });
    subscribe(channel: string | string[]): boolean;
    unsubscribe(channel: string | string[]): void | string[];
}
