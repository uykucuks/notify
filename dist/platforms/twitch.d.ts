/// <reference types="node" />
import { Live, Client } from '../interfaces';
import EventEmitter from 'events';
export declare class LivecordTwitch extends EventEmitter {
    channels: string[];
    lives: Live[];
    client: Client;
    useDatabase: boolean;
    constructor({ client, interval, useDatabase }: {
        client: Client;
        interval: number;
        useDatabase: boolean;
    });
    follow(channel: string | string[]): number;
    unfollow(channel: string | string[]): void | string[];
    getUser(userId: string): Promise<any>;
    static getToken(clientId: string, clientSecret: string): Promise<any>;
}
