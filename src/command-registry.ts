import * as commando from 'discord.js-commando';
import { LoggerClient } from './logger';
import HelpCommand from './commands/help';

export default class LoggerCommandRegistry extends commando.CommandoRegistry {
  public readonly client!: LoggerClient;
  public constructor(c: LoggerClient) {
    super(c);
  }

  public registerDefaults(): commando.CommandoRegistry {
    super.registerDefaults();
    return this;
  }
}
