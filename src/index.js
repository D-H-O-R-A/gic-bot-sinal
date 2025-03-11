const { Telegraf } = require('telegraf');
const { GIC_CONFIG } = require('./config/env');
const { setupCommands } = require('./bot/commands');

// Substitua pelo seu token do bot do Telegram
const TOKEN = GIC_CONFIG.BOT_TOKEN;

const bot = new Telegraf(TOKEN);

setupCommands(bot);

bot.catch((err) => {
  console.error('Bot error:', err);  // Altere para console.error para evitar problemas com logger não definido
});

bot.start(() => {
  console.log('Bot is started...');
});

bot.launch();  // Assegure-se de lançar o bot
