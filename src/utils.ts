import {MessageAttachment, MessageEmbed} from 'discord.js';
import * as fs from 'fs';
import { Config } from "./data/structures";

const config: Config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

export const mentionRegex = /<@!?([0-9]*)>/g;

export function isImage(img: MessageAttachment): void {
    config.fileExtensions.forEach(extension => {
        if (img.url.toUpperCase().endsWith(extension.toUpperCase())) {
            return true;
        } else {
            return false;
        }
    });
}

export function createEmbed(name: string, desc: string): MessageEmbed {
    return new MessageEmbed({
        title: name,
        description: desc
    })
}