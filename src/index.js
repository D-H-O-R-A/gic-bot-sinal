const { Telegraf } = require('telegraf');
const { GIC_CONFIG } = require('./config/env');
const { setupCommands } = require('./bot/commands');
const {logger} = require('./config/logger');

// Substitua pelo seu token do bot do Telegram
const TOKEN = GIC_CONFIG.BOT_TOKEN;

const bot = new Telegraf(TOKEN);

setupCommands(bot);

bot.catch((err) => {
  logger.error('Bot error:', err);  
});

bot.start(() => {
  logger.info('Bot is started...');
});

bot.launch();  // Assegure-se de lançar o bot
