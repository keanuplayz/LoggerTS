import * as discord from 'discord.js';
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

export abstract class LoggerCommand extends commando.Command {
  public client!: LoggerClient;
  public constructor(client: LoggerClient, options: commando.CommandInfo) {
    super(client, options);
    if (!this.throttling) {
      this.throttling = {
        usages: 8,
        duration: 45,
      };
    }
  }

  public async onBlock(
    message: commando.CommandoMessage,
    reason: string,
    data?: Record<string, unknown>,
  ): Promise<discord.Message | discord.Message[]> {
    if (reason === 'throttling') return [];
    return super.onBlock(message, reason, data);
  }
}
