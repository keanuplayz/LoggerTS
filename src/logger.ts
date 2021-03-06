import * as commando from 'discord.js-commando';

export abstract class LoggerClient extends commando.CommandoClient {
  protected constructor(co: commando.CommandoClientOptions) {
    co.fetchAllMembers = true;
    super(co);

    this.once('ready', (): void => {
      console.log(`Ready!`);
    });
  }
}
