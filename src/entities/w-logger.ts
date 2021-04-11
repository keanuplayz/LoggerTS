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

export interface WLoggerData extends EntityData {
    sendChannel: string;
    logChannels: string[];
    keywords: string[];
    spoilerIDs: string[];
    pingIDs: string[];
    downloadChannels: string[];
}

/// Listens for messages in specific channels, and redirects them to a specific channel.
export class WLoggerEntity extends CCBotEntity {
    // All data definitions for the entity.
    private messageListener: (m: discord.Message) => void;
    private editListener: (prev: discord.Message | discord.PartialMessage, next: discord.Message | discord.PartialMessage) => void;
    private deleteListener: (m: discord.Message | discord.PartialMessage) => void;
    private mediaListener: (m: discord.Message) => void;
    public readonly sendChannel: string;
    public readonly logChannels: string[];
    public readonly keywords: string[];
    public readonly spoilerIDs: string[];
    public readonly pingIDs: string[];
    public readonly downloadChannels: string[];

    public constructor(c: CCBot, data: WLoggerData) {
        super(c, 'wlogger', data);

        // Make the data from LoggerData known to the LoggerEntity class.
        this.sendChannel = data.sendChannel;
        this.logChannels = data.logChannels;
        this.keywords = data.keywords;
        this.spoilerIDs = data.spoilerIDs;
        this.pingIDs = data.pingIDs;
        this.downloadChannels = data.downloadChannels;

        // Listener for rerouting the messages from selected channels.
        this.messageListener = (m: discord.Message): void => {
            // Some checks to make sure no weirdness happens.
            if (this.killed)
                return;
            if (m.author.username === c.user?.username)
                return;

            // Definitions for later use.
            const logChan = c.channels.cache.get(this.sendChannel) as discord.TextChannel;
            const webhooks = logChan.fetchWebhooks()
            const chan = m.channel as discord.TextChannel;
            const attachArray: discord.MessageAttachment[] = [];

            if (m.attachments.size !== 0 && this.logChannels.includes(chan.id)) {
                m.attachments.forEach(a => {
                    attachArray.push(new discord.MessageAttachment(a.url, `${this.spoilerIDs.includes(m.author.id) ? `SPOILER_${a.name}` : a.name}`));
                })
                webhooks.then(hooks => {
                    const hook = hooks.first();
                    const options: discord.WebhookMessageOptions = {
                        username: m.author.username,
                        avatarURL: m.author.avatarURL({ dynamic: true })?.toString(),
                        files: attachArray
                    }
                    hook?.send(options)
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
                if (m.content) {
                    webhooks.then(hooks => {
                        const hook = hooks.first();
                        const options: discord.WebhookMessageOptions = {
                            username: `${m.author.username} (#${chan.name})`,
                            avatarURL: m.author.avatarURL({ dynamic: true })?.toString(),
                        }
                        if (this.spoilerIDs.includes(m.author.id)) {
                            hook?.send(`${this.keywords.some(a=>m.content.includes(a)) ? `${pingtext}\n||${m.content}||` : `||${m.content}||`}`, options)
                        } else {
                            hook?.send(`${this.keywords.some(a=>m.content.includes(a)) ? `${pingtext}\n${m.content}` : `${m.content}`}`, options)
                        }
                    })
                }
            }

        };

        // Listener for rerouting updated messages from selected channels.
        this.editListener = (prev: discord.Message | discord.PartialMessage, next: discord.Message | discord.PartialMessage): void => {
            if (this.killed)
                return;
            if (prev.author?.username === c.user?.username)
                return;

            // Definitions for later use.
            const logChan = c.channels.cache.get(this.sendChannel) as discord.TextChannel;
            const webhooks = logChan.fetchWebhooks();
            const chan = prev.channel as discord.TextChannel;

            // Add every ID that should be pinged into the message content.
            let pingtext = "";
            this.pingIDs.forEach(id => {pingtext += `<@${id}> `});

            if(this.logChannels.includes(chan.id)) {
                if (prev.content) {
                    webhooks.then(hooks => {
                        const hook = hooks.first();
                        const options: discord.WebhookMessageOptions = {
                            username: `${prev.author?.username} (#${chan.name})`,
                            avatarURL: prev.author?.avatarURL({ dynamic: true })?.toString()
                        }
                        // oh god please save me.
                        /// @ts-expect-error please, god please, the previous message will always hold the previous content you dimwit
                        if (this.spoilerIDs.includes(prev.author.id)) {
                            hook?.send(`${this.keywords.some(a=>next.content?.includes(a)) ? `${pingtext}\n**Previous:** ||${prev.content}||\n**Edited:** ||${next.content}||` : `**Previous:** ||${prev.content}||\n**Edited:** ||${next.content}||`}`, options)
                        } else {
                            hook?.send(`${this.keywords.some(a=>next.content?.includes(a)) ? `${pingtext}\n**Previous:** ${prev.content}\n**Edited:** ${next.content}` : `**Previous:** ${prev.content}\n**Edited:** ${next.content}`}`, options)
                        }
                    })
                }
            }
        }

        this.deleteListener = (m: discord.Message | discord.PartialMessage): void => {
            if (this.killed)
                return;
            if (m.author?.username === c.user?.username)
            return;

            // Definitions for later use.
            const logChan = c.channels.cache.get(this.sendChannel) as discord.TextChannel;
            const webhooks = logChan.fetchWebhooks();
            const chan = m.channel as discord.TextChannel;

            if(this.logChannels.includes(chan.id)) {
                webhooks.then(hooks => {
                    const hook = hooks.first();
                    const options: discord.WebhookMessageOptions = {
                        username: `${m.author?.username} (#${chan.name})`,
                        avatarURL: m.author?.avatarURL({ dynamic: true })?.toString()
                    }
                    // oh god please save me.
                    /// @ts-expect-error please, god please, the previous message will always hold the previous content you dimwit
                    if (this.spoilerIDs.includes(m.author.id)) {
                        hook?.send(`**Deleted:** ||${m.content}||`, options);
                    } else {
                        hook?.send(`**Deleted:** ${m.content}`, options);
                    }
                })
            }
        }

        // Message listener for automatically downloading media to a selectable directory.
        this.mediaListener = (m: discord.Message): void => {
            // Some checks to make sure no weirdness happens.
            if (this.killed)
                return;
            if (m.author.username === c.user?.username)
                return;

            // Definitions for later use.
            const chan = m.channel as discord.TextChannel;
            const mediaArray = m.attachments.array();

            // Check if the channel from which the image originates is the channel where media should be downloaded from.
            if (this.downloadChannels.includes(chan.id)) {
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
        this.client.on('messageUpdate', this.editListener);
        this.client.on('messageDelete', this.deleteListener);
    }

    // Make sure all listeners are removed when the entity is killed.
    public onKill(transferOwnership: boolean): void {
        super.onKill(transferOwnership);
        this.client.removeListener('message', this.messageListener);
        this.client.removeListener('message', this.mediaListener);
        this.client.removeListener('messageUpdate', this.editListener);
        this.client.removeListener('messageDelete', this.deleteListener);
    }

    // Properly save the data to the `entities.json` file in `dynamic-data`.
    public toSaveData(): WLoggerData {
        return Object.assign(super.toSaveData(), {
            sendChannel: this.sendChannel,
            logChannels: this.logChannels,
            keywords: this.keywords,
            spoilerIDs: this.spoilerIDs,
            pingIDs: this.pingIDs,
            downloadChannels: this.downloadChannels
        });
    }
}

export default async function load(c: CCBot, data: WLoggerData): Promise<CCBotEntity> {
    return new WLoggerEntity(c, data);
}
