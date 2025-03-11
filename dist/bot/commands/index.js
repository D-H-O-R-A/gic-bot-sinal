"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCommands = setupCommands;
const start_command_1 = require("./start.command");
const group_command_1 = require("./group.command");
const consult_command_1 = require("./consult.command");
const token_command_1 = require("./token.command");
function setupCommands(bot) {
    bot.start(start_command_1.startCommand);
    bot.command('setup_group', group_command_1.setupGroupCommand);
    bot.command('consult', consult_command_1.consultCommand);
    bot.on('text', token_command_1.handleTokenInput);
}
