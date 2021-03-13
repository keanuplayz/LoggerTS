# Dynamic Data

This document provides some simple examples on the structure of all the json files in the `dynamic-data` directory.

## `commands.json`

First off, the commands file. This file contains all commands that do not need a separate file, simply because they are too small or insignificant.

This is where CCBot's structure shines, in my opinion. The JSON commands are structured quite simply. Here follows a complete example:

```json
{
    "groupname": {
        "commandname": {
            "description": "Command description here.",
            "format": "Content of the message. Supports formatted statements. %(emote leaCheese)",
            "nsfw": "false", // command can only be run in NSFW channels if true
            "commandReactions": ["emote", "names", "here"],
            "options": "refer to commando.CommandInfo",
            "embed": { // refer to discord.MessageEmbedOptions
                "title": "Embed title here.",
                "url": "URL that title points to here.",
                "image": {
                    "url": "URL of image here."
                }
            }
        }
    }
}
```

## `init-entities.json`

The init-entities file contains an object-array of all entities that should start on bot-launch. All required entity data should, of course, be passed.

The syntax for each entity is exactly the same as for the `entities.newEntity` function.

For example:

```js
client.entities.newEntity({ type: "random-activity", intervalMs: "30000", activities: [{ type: "PLAYING", name: "with fire" }] })
```

is, in the JSON file, equivalent to,

```json
[
    {
        "type": "random-activity",
        "intervalMs": 30000,
        "activities": [
            {
                "type": "PLAYING",
                "name": "with fire"
            }
        ]
    }
]
```

So now you don't have to invoke `newEntity` every time. Great.

## `init-settings.json`

So, settings. For a full explanation of these, refer to `SETTINGS.md` and `ROLES.md`.

Basically, we have our `global`, `local`, and `user` settings.

- `global` settings 
- `local` settings can have a `user-` setting, but that will make it only accessible to the guild it is set in. (such as `roles-group-auto-user-<user ID>`)
- `user` settings are essentially global, since they are saved in the user's datablock. (`user-datablock-<user ID>`)

So, as an example file:

```json
{
    "guild ID": {
        "comment": "This is ignored. Can be used for server names or short notes.",
        "channel-editlog": "channel name"
    },
    "global": {
        "comment": "Every guild will inherit these settings, as they are global. For example, you can set emote overrides here.",
        "emotes": ["leaCheese"],
        "emote-leaCheese": "257888171772215296"
    }
}
```