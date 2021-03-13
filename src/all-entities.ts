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

import loadDateActivity from './entities/date-activity';
import loadPageSwitcher from './entities/page-switcher';
import {loadPurgeDatabase, loadPurgeDatabaseChannel} from './entities/purge-database';
import loadCountdownActivity from './entities/countdown-activity';
import {CCBot} from './ccbot';

/// Registers all the entities. (More or less.)
export default function registerAllEntities(cr: CCBot): void {
    cr.entities
        .registerEntityType('date-activity', loadDateActivity)
        .registerEntityType('page-switcher', loadPageSwitcher)
        .registerEntityType('purge-database', loadPurgeDatabase)
        .registerEntityType('purge-database-channel', loadPurgeDatabaseChannel)
        .registerEntityType('countdown-activity', loadCountdownActivity);
}
