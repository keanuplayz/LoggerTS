import * as fs from 'fs';
import { Secrets } from './data/structures';
import LoggerImpl from './logger-impl';
import { LoggerClient } from './logger';

class LoggerMain {
  public readonly client: LoggerClient;
  public readonly secrets: Secrets;

  public constructor() {
    this.secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
    this.client = new LoggerImpl({
      owner: this.secrets.owner,
      commandPrefix: this.secrets.commandPrefix,
    });

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
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGUSR1', shutdown);
process.on('SIGUSR2', shutdown);
