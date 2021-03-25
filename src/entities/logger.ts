// Copyright (C) 2019-2020 CCDirectLink members
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import * as https from 'https';
import * as fs from 'fs';
import * as discord from 'discord.js';
import {CCBot, CCBotEntity} from '../ccbot';
import {EntityData} from '../entity-registry';
import {randomID} from '../utils';

export interface LoggerData extends EntityData {
    sendChannel: string;
    logChannels: string[];
    spoilerIDs: string[];
    keywords: string[];
    pingIDs: string[];
    mediaChannel: string;
}

/// Listens for messages in specific channels, and redirects them to a specific channel.
class LoggerEntity extends CCBotEntity {
    // All data definitions for the entity.
    private messageListener: (m: discord.Message) => void;
    private mediaListener: (m: discord.Message) => void;
    public readonly sendChannel: string;
    public readonly logChannels: string[];
    public readonly spoilerIDs: string[];
    public readonly keywords: string[];
    public readonly pingIDs: string[];
    public readonly mediaChannel: string;

    public constructor(c: CCBot, data: LoggerData) {
        super(c, 'logger', data);

        // Make the data from LoggerData known to the LoggerEntity class.
        this.sendChannel = data.sendChannel;
        this.logChannels = data.logChannels;
        this.spoilerIDs = data.spoilerIDs;
        this.keywords = data.keywords;
        this.pingIDs = data.pingIDs;
        this.mediaChannel = data.mediaChannel;

        // Listener for rerouting the messages from selected channels.
        this.messageListener = (m: discord.Message): void => {
            // Some checks to make sure no weirdness happens.
            if (this.killed)
                return;
            if (m.author.username === c.user?.username)
                return;

            // Definitions for later use.
            const logChan = c.channels.cache.get(this.sendChannel) as discord.TextChannel;
            const chan = m.channel as discord.TextChannel;

            // Embed 
            const logEmbed = new discord.MessageEmbed({ color: 0x0F9D58 });
            logEmbed.setAuthor(`Message in ${chan.name}`, m.author.displayAvatarURL({ dynamic: true }));
            logEmbed.setTitle(`${m.author.username} says:`);

            if(this.spoilerIDs.includes(m.author.id)) {
                logEmbed.setDescription(`||${m.content}||`)
            } else {
                logEmbed.setDescription(m.content);
            }

            if (m.attachments.size !== 0) {
                m.attachments.forEach(attachment => {
                    logChan.send(`${m.author.username} uploaded:`, { files: [attachment.url] })
                })
            }

            // Add every ID that should be pinged into the message content.
            let pingtext = "";
            this.pingIDs.forEach(id => {pingtext += `<@${id}> `});

            /*
              If the array of channels that should be logged
              *include* the ID of the channel that the message originates from,
              send the embed we created.
            */
            if(this.logChannels.includes(chan.id)) {
                logChan.send(`${this.keywords.some(a=>m.content.includes(a)) ? pingtext : ""}`, { embed: logEmbed });
            }

        };

        // Message listener for automatically downloading media to a selectable directory.
        this.mediaListener = (m: discord.Message): void => {
            // Some checks to make sure no weirdness happens.
            if (this.killed)
                return;
            if (m.author.username === c.user?.username)
                return;

            // Definitions for later use.
            const chan = m.channel as discord.TextChannel;
            const mediaChan = c.channels.cache.get(this.mediaChannel) as discord.TextChannel;
            const mediaArray = m.attachments.array();

            // Check if the channel from which the image originates is the channel where media should be downloaded from.
            if (mediaChan.id == chan.id) {
                // Check if the media directory actually exists, and if not, create it.
                if (!fs.existsSync("dynamic-data/media")) {
                    fs.mkdirSync("dynamic-data/media");
                }
                // Then, for each file in the array of attachments in the message,
                mediaArray.forEach(file => {
                    // Create a writestream for later use,
                    let downFile = fs.createWriteStream(`dynamic-data/media/${randomID()} - ${file.name}`)
                    https.get(file.url, res => {
                        // And pipe the attachment content into the writestream.
                        res.pipe(downFile)
                    })
                })
            }
        };

        // Register the message listeners.
        this.client.on('message', this.messageListener);
        this.client.on('message', this.mediaListener);
    }

    // Make sure all listeners are removed when the entity is killed.
    public onKill(transferOwnership: boolean): void {
        super.onKill(transferOwnership);
        this.client.removeListener('message', this.mediaListener);
        this.client.removeListener('message', this.messageListener);
    }

    // Properly save the data to the `entities.json` file in `dynamic-data`.
    public toSaveData(): LoggerData {
        return Object.assign(super.toSaveData(), {
            sendChannel: this.sendChannel,
            logChannels: this.logChannels,
            spoilerIDs: this.spoilerIDs,
            keywords: this.keywords,
            pingIDs: this.pingIDs,
            mediaChannel: this.mediaChannel
        });
    }
}

export default async function load(c: CCBot, data: LoggerData): Promise<CCBotEntity> {
    return new LoggerEntity(c, data);
}
