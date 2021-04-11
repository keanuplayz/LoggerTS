import * as discord from 'discord.js';
import * as commando from 'discord.js-commando';
import {CCBot, CCBotCommand} from '../ccbot';
import {WLoggerEntity} from '../entities/w-logger';
import * as moment from 'moment';

export class LoggerInfoCommand extends CCBotCommand {
    public constructor(client: CCBot) {
        const opt = {
            name: 'info',
            description: 'Shows info about currently active logger entity.',
            group: 'logger',
            memberName: 'info',
            hidden: true,
            guildOnly: true
        };
        super(client, opt);
    }

    public async run(message: commando.CommandoMessage): Promise<discord.Message|discord.Message[]> {
        const entityName = 'wlogger';
        const logger = this.client.entities.getEntity<WLoggerEntity>(entityName);

        if (logger) {
        
            let logChannels = '';
            logger.logChannels.forEach(channel => {
                const chan = this.client.channels.cache.get(channel) as discord.TextChannel;
                logChannels += `${chan.name} (${chan.id})\n`;
            });

            const sendChannel = this.client.channels.cache.get(logger.sendChannel) as discord.TextChannel;

            let downloadChannels = '';
            logger.downloadChannels.forEach(channel => {
                const chan = this.client.channels.cache.get(channel) as discord.TextChannel;
                downloadChannels += `${chan.name} (${chan.id})\n`;
            });

            let spoilerUsers = '';
            logger.spoilerIDs.forEach(id =>{
                const user = this.client.users.cache.get(id) as discord.User;
                spoilerUsers += `${user.username}#${user.discriminator} (${user.id})\n`;
            });
        
            const infoEmbed = new discord.MessageEmbed({
                title: '**-Logger Info-**',
                fields: [
                    {
                        name: 'Logging channels:',
                        value: logChannels || 'None'
                    },
                    {
                        name: 'Sending to:',
                        value: `${sendChannel.name} (${sendChannel.id})`
                    },
                    {
                        name: 'Auto-downloading images from:',
                        value: downloadChannels || 'None'
                    },
                    {
                        name: 'Spoilering content from:',
                        value: spoilerUsers || 'None'
                    }
                ],
                footer: { text: 'TravBot Message Log' },
                color: 0x9e3a33
            });

            return message.say(infoEmbed);
        }
        return message.say(`ooo! You haven't started the logger! (no ${entityName})`);
    }
}

// Based off https://github.com/keanuplayz/travbot-v3/blob/typescript/src/commands/utility/scanemotes.ts
export class LoggerScanCommand extends CCBotCommand {
    public constructor(client: CCBot) {
        const opt = {
            name: 'scan',
            description: 'Scans a channel for a certain string.',
            group: 'logger',
            memberName: 'scan',
            hidden: true,
            guildOnly: true,
            args: [
                {
                    key: 'search',
                    prompt: 'Search term',
                    type: 'string',
                    default: ''
                }
            ]
        }
        super(client, opt)
    }

    public async run(message: commando.CommandoMessage, args: {search: string}): Promise<discord.Message|discord.Message[]> {
        const entityName = 'wlogger'
        const logger = this.client.entities.getEntity<WLoggerEntity>(entityName);

        if (logger) {
            const search = new RegExp(`${args.search}`, 'gi');
            const startTime = Date.now()
            let totalUserQueryUsage = 0;

            const searchChannels = this.client.channels.cache.filter(
                (channel) => channel.type === 'text' && logger.logChannels.includes(channel.id)
            ) as discord.Collection<string, discord.TextChannel>

            let messagesSearched = 0;
            let channelsSearched = 0;
            let currentChannelName = "";
            const totalChannels = searchChannels.size;
            const statusMessage = await message.say(`Searching ${totalChannels} channels...`);
            message.channel.startTyping();

            const interval = setInterval(() => {
                statusMessage.edit(`Searching channel \`${currentChannelName}\`... (${messagesSearched} messages scanned, ${channelsSearched}/${totalChannels} channels scanned)`)

            })

            for (const channel of searchChannels.values()) {
                currentChannelName = channel.name;
                let selected = channel.lastMessageID ?? message.id;
                let continueloop = true;

                while (continueloop) {
                    const messages = await channel.messages.fetch({
                        limit: 100,
                        before: selected
                    });

                    if (messages.size > 0) {
                        for (const msg of messages.values()) {
                            const text = msg.content;
                            let match: RegExpExecArray | null;
                            match = search.exec(text);
                            while (match) {
                                totalUserQueryUsage++;
                            }
                        }

                        selected = channel.id;
                        messagesSearched++;
                    }
                    else {
                        continueloop = false;
                        channelsSearched++;
                    }
                }
            }

            const finishTime = Date.now()
            clearInterval(interval);
            statusMessage.edit(`Finished operation in ${moment.duration(finishTime - startTime).humanize()}.`);
            message.channel.stopTyping();

            return await message.say(`Found ${totalUserQueryUsage} times.`);
        }

        return message.say(`ooo! You haven't started the logger! (no ${entityName})`);
    }
}