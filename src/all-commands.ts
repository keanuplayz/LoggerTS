import TestCommand from './commands/test';
import HelpCommand from './commands/help';
import PingCommand from './commands/ping';
import { LoggerClient } from './logger';

export default function registerAllCommands(cr: LoggerClient): void {
  cr.registry.registerDefaultTypes();
  cr.registry.registerDefaultGroups();
  cr.registry.registerDefaultCommands({
    help: true,
    prefix: true,
    eval: true,
    ping: false,
    commandState: true,
    unknownCommand: true,
  });

  cr.registry
    .registerGroup('general')
    .registerCommand(new TestCommand(cr))
    .registerCommand(new PingCommand(cr));
}
