import * as commando from 'discord.js-commando';
import { LoggerClient } from './logger';

export default class LoggerImpl extends LoggerClient {
  public constructor(co: commando.CommandoClientOptions) {
    super(co);
  }
}
