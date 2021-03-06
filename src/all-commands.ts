import TestCommand from './commands/test';
import { LoggerClient } from './logger';

export default function registerAllCommands(cr: LoggerClient): void {
  cr.registry.registerDefaultTypes();
  cr.registry.registerDefaultGroups();
  cr.registry.registerDefaultCommands({
    help: true,
    prefix: true,
    eval: true,
    ping: true,
    commandState: true,
    unknownCommand: true,
  });

  cr.registry.registerGroup('general').registerCommand(new TestCommand(cr));
}
