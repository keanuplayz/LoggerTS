// Copyright (C) 2019-2020 CCDirectLink members
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import ReloadCommand from './commands/reload';
import CounterCommand from './commands/counter';
import PingCommand from './commands/ping';
import {SettingsCommand, SettingsContext, SettingsOperation, ShowUserSettingsCommand} from './commands/settings';
import {CCBot} from './ccbot';

/// Registers all the commands. (More or less.)
export default function registerAllCommands(cr: CCBot): void {
    cr.registry.registerDefaultTypes();
    cr.registry.registerDefaultGroups();
    cr.registry.registerDefaultCommands({
        help: false, // not compatible with the new dispatcher
        prefix: true,
        eval: true,
        ping: false,
        commandState: true,
        unknownCommand: false // we have our own implementation in commands.json
    });

    // util
    cr.registry
        .registerCommand(new ReloadCommand(cr))
        .registerCommand(new SettingsCommand(cr, SettingsOperation.Get, SettingsContext.Global))
        .registerCommand(new SettingsCommand(cr, SettingsOperation.Set, SettingsContext.Global))
        .registerCommand(new SettingsCommand(cr, SettingsOperation.Rm, SettingsContext.Global))
        .registerCommand(new SettingsCommand(cr, SettingsOperation.Get, SettingsContext.Local))
        .registerCommand(new SettingsCommand(cr, SettingsOperation.Set, SettingsContext.Local))
        .registerCommand(new SettingsCommand(cr, SettingsOperation.Rm, SettingsContext.Local))
        .registerCommand(new SettingsCommand(cr, SettingsOperation.Get, SettingsContext.User))
        .registerCommand(new SettingsCommand(cr, SettingsOperation.Set, SettingsContext.User))
        .registerCommand(new SettingsCommand(cr, SettingsOperation.Rm, SettingsContext.User))
        .registerCommand(new ShowUserSettingsCommand(cr))
        .registerCommand(new CounterCommand(cr))

        .registerGroup('general')
        .registerCommand(new PingCommand(cr))
        .registerGroup('roles')
}
