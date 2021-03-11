import * as fs from 'fs';
import { Config, Data, Secrets } from './data/structures';
import LoggerImpl from './logger-impl';
import { LoggerClient } from './logger';
import { TextChannel } from 'discord.js';
import { createEmbed } from './utils';

class LoggerMain {
  public readonly client: LoggerClient;
  public readonly secrets: Secrets;
  public readonly config: Config;
  public readonly data: Data;

  public constructor() {
    this.secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
    this.client = new LoggerImpl({
      owner: this.secrets.owner,
      commandPrefix: this.secrets.commandPrefix,
    });
    this.config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    this.data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

    const kickstart = async (): Promise<void> => {
      try {
        await this.client.login(this.secrets.token);
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
    };
    kickstart();
  }
}

const logger = new LoggerMain();
let shuttingDown = false;
let cmdText = '';

logger.client.on('ready', (): void => {
  console.log(logger.client.commandPrefix);
  logger.client.registry.commands.forEach((command) => {
    command.name += cmdText;
  });
  console.log(cmdText);
});

logger.client.on('message', (msg) => {
  if (msg.author.id == logger.client.user?.id) return;
  console.log(msg.content)
  const chan = logger.client.channels.cache.get(logger.config.sendChannel) as TextChannel;
  const source = logger.client.channels.cache.get(msg.channel.id) as TextChannel;
  const emb = createEmbed(`Message from ${source.name}`, msg.content);
  chan.send({ embed: emb });
})

async function shutdown(): Promise<void> {
  if (shuttingDown) return;
  console.log('Goodbye.');
  shuttingDown = true;
  try {
    logger.client.destroy();
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

process.on('exit', shutdown);
// process.on('SIGINT', shutdown);
// process.on('SIGTERM', shutdown);
// process.on('SIGUSR1', shutdown);
// process.on('SIGUSR2', shutdown);
