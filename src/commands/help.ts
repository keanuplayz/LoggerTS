import * as discord from 'discord.js';
import * as commando from 'discord.js-commando';
import { LoggerClient, LoggerCommand } from '../logger';

export default class HelpCommand extends LoggerCommand {
  public constructor(client: LoggerClient, group: string) {
    const opt = {
      name: `-${group}, help`,
      description: "provides the text you're reading!",
      group,
      memberName: 'help',
    };
    super(client, opt);
  }

  public async run(
    message: commando.CommandoMessage,
  ): Promise<discord.Message | discord.Message[]> {
    const lines = [`__**${this.group.name} Commands**__`, ''];

    if (this.groupID == 'general') {
      lines.push('To send a command, prefix the bot prefix (or a ping to the bot).');
      lines.push("The bot prefix/ping isn't necessary in DMs.");
      lines.push('');
    }

    for (const cmd of this.group.commands.values()) {
      const fmt = cmd.format ? ` ${cmd.format}` : '';
      if (cmd.description != 'UNDOCUMENTED') {
        if (this.groupID === 'general') {
          lines.push(`** ${cmd.memberName}${fmt} **: ${cmd.description}`);
        } else {
          lines.push(`** -${this.group.id} ${cmd.memberName}${fmt} **: ${cmd.description}`);
        }
      }
    }

    // Append some details on other groups
    const allGroups = this.client.registry.groups.keyArray();
    lines.push('');
    lines.push(`Also see: \`-${allGroups.join(' help`, `-')} help\``);

    // The text is set in stone from here on in.
    const text = [lines.join('\n')];
    let index = 0;
    while (index < text.length) {
      let didSomethingThisRound = false;
      while (text[index].length > 2000) {
        const target = text[index];
        let breakp = target.lastIndexOf('\n');
        if (breakp == -1) breakp = target.length / 2;
        text[index] = target.substring(0, breakp);
        if (!didSomethingThisRound) {
          text[index + 1] = target.substring(breakp + 1);
          didSomethingThisRound = true;
        } else {
          text[index + 1] = `${target.substring(breakp + 1)}\n${text[index + 1]}`;
        }
      }
      index++;
    }
    if (message.channel instanceof discord.DMChannel) {
      const array: discord.Message[] = [];
      for (const str of text) array.push(await message.say(str));
      return array;
    } else {
      try {
        for (const str of text) await message.author.send(str);
        return await message.say('The help page has been sent to your DMs.');
      } catch (_e) {
        console.log(_e);
        return await message.say(
          'Tried to send help information to DMs, but... are your DMs blocked?',
        );
      }
    }
  }
}
