const { startCommand,consultCommand } = require('./messages');
const { callSwapRealtime } = require('./realtime');
const {setConfigCommand,addimage} = require('../config/tools');

function setupCommands(bot) {
  bot.start(startCommand);  // Define o comando /start
  bot.command('price', consultCommand);
  bot.command('setconfig', setConfigCommand);
  bot.command('startmonitoring', callSwapRealtime);
  bot.command('addimage', addimage)
}

module.exports = { setupCommands };
