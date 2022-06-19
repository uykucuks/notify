"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTube = exports.Twitch = void 0;
var twitch_1 = require("./platforms/twitch");
Object.defineProperty(exports, "Twitch", { enumerable: true, get: function () { return twitch_1.LivecordTwitch; } });
var youtube_1 = require("./platforms/youtube");
Object.defineProperty(exports, "YouTube", { enumerable: true, get: function () { return youtube_1.LivecordYoutube; } });
