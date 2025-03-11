import { Telegraf } from 'telegraf';
import { startCommand } from './start.command';
import { setupGroupCommand } from './group.command';
import { consultCommand } from './consult.command';
import { handleTokenInput } from './token.command';

export function setupCommands(bot: Telegraf) {
  bot.start(startCommand);
  bot.command('setup_group', setupGroupCommand);
  bot.command('consult', consultCommand);
  bot.on('text', handleTokenInput);
}