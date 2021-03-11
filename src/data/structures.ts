export interface Secrets {
  // Discord bot token.
  token: string;
  // Prefix for commands.
  commandPrefix: string;
  // Bot owners.
  owner: string | string[];
}

export interface Config {
  guildID: string;
  sendChannel: string;
  listenChannels: string[];
  pingIDs: string[];
  keywords: string[];
  spoilerIDs: string[];
  fileExtensions: string[];
}

export interface Data {
  hornyCount: number,
  author: Record<string, number>,
  subDom: {
    sub: number,
    dom: number
  }
}