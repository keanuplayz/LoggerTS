import * as discord from 'discord.js';
import * as commando from 'discord.js-commando';
import { LoggerClient, LoggerCommand } from '../logger';

export default class TestCommand extends LoggerCommand {
  public constructor(client: LoggerClient) {
    const opt = {
      name: 'test',
      description: 'test command',
      group: 'general',
      memberName: 'test',
    };
    super(client, opt);
  }

  public async run(
    message: commando.CommandoMessage,
  ): Promise<discord.Message | discord.Message[]> {
    return await message.say('test');
  }
}
