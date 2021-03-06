import * as discord from 'discord.js';
import * as commando from 'discord.js-commando';
import { LoggerClient, LoggerCommand } from '../logger';

export default class PingCommand extends LoggerCommand {
  public constructor(client: LoggerClient) {
    const opt = {
      name: 'ping',
      description: 'tests bot response time',
      group: 'general',
      memberName: 'ping',
    };
    super(client, opt);
  }

  public async run(
    message: commando.CommandoMessage,
  ): Promise<discord.Message | discord.Message[]> {
    const themUs = Date.now() - message.createdTimestamp;
    const message1 = (await message.reply(
      `>:) pew pew. Got here in ${themUs} ms, and...`,
    )) as discord.Message;
    const newDuration = Date.now() - message1.createdTimestamp;
    const message2 = await message.say(`sent back in ${newDuration} ms.`);
    return [message1, message2];
  }
}
