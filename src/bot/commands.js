const { startCommand,consultCommand,statusnode,devdetails,chartdetails } = require('./messages');
const { callSwapRealtime } = require('./realtime');
const {setConfigCommand} = require('../config/tools');

function setupCommands(bot) {
  bot.start(startCommand);  // Define o comando /start
  bot.command('price', consultCommand);
  bot.command('setconfig', setConfigCommand);
  bot.command('startmonitoring', callSwapRealtime);
  bot.command('statusnode', statusnode)
  bot.command('devdetails', devdetails)
  bot.command('chart', chartdetails)
}

module.exports = { setupCommands };
