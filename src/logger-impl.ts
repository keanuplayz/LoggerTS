import * as commando from 'discord.js-commando';
import { LoggerClient } from './logger';
import LoggerCommandRegistry from './command-registry';
import registerAllCommands from './all-commands';

export default class LoggerImpl extends LoggerClient {
  public constructor(co: commando.CommandoClientOptions) {
    super(co);
    this.registry = new LoggerCommandRegistry(this);
    registerAllCommands(this);
  }
}
