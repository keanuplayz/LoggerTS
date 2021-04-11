import * as discord from 'discord.js';
import * as commando from 'discord.js-commando';
import {CCBot, CCBotCommand} from '../ccbot';
import {WLoggerEntity} from '../entities/w-logger';
import * as moment from 'moment';
import { stringify } from 'node:querystring';

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
                        value: logChannels ? logChannels : 'None'
                    },
                    {
                        name: 'Sending to:',
                        value: `${sendChannel.name} (${sendChannel.id})`
                    },
                    {
                        name: 'Auto-downloading images from:',
                        value: downloadChannels ? downloadChannels : 'None'
                    },
                    {
                        name: 'Spoilering content from:',
                        value: spoilerUsers ? spoilerUsers : 'None'
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