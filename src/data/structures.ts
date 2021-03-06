export interface Secrets {
  // Discord bot token.
  token: string;
  // Prefix for commands.
  commandPrefix: string;
  // Bot owners.
  owner: string | string[];
}
