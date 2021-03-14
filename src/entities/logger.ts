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

import * as discord from 'discord.js';
import {CCBot, CCBotEntity} from '../ccbot';
import {EntityData} from '../entity-registry';

export interface LoggerData extends EntityData {
    sendChannel: string;
    logChannels: string[];
}

/// Implements old behaviors into the bot.
class LoggerEntity extends CCBotEntity {
    private messageListener: (m: discord.Message) => void;
    public readonly sendChannel: string;
    public readonly logChannels: string[];

    public constructor(c: CCBot, data: LoggerData) {
        super(c, 'logger', data);
        this.sendChannel = data.sendChannel;
        this.logChannels = data.logChannels;
        
        this.messageListener = (m: discord.Message): void => {
            if (this.killed)
                return;
            if (m.author.username === c.user?.username)
                return;

            const logChan = c.channels.cache.get(this.sendChannel) as discord.TextChannel
            const chan = m.channel as discord.TextChannel
            
            if(this.logChannels.includes(chan.id)) {
                logChan.send(m.content)
            }
            
        };
        this.client.on('message', this.messageListener);
    }

    public onKill(transferOwnership: boolean): void {
        super.onKill(transferOwnership);
        this.client.removeListener('message', this.messageListener);
    }

    public toSaveData(): LoggerData {
        return Object.assign(super.toSaveData(), {
            sendChannel: this.sendChannel,
            logChannels: this.logChannels
        });
    }
}

export default async function load(c: CCBot, data: LoggerData): Promise<CCBotEntity> {
    return new LoggerEntity(c, data);
}
