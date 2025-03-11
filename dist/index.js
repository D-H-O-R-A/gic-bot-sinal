"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("./bot/bot");
const listener_1 = require("./blockchain/listener");
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
require("reflect-metadata");
const start = async () => {
    try {
        const bot = (0, bot_1.initBot)();
        const listener = new listener_1.BlockchainListener();
        await bot.launch();
        await listener.start();
        logger_1.logger.info(`Bot started on chain ${config_1.GIC_CONFIG.CHAIN_ID}`);
        logger_1.logger.info('Listening for swaps...');
    }
    catch (error) {
        logger_1.logger.error('Failed to start:', error);
        process.exit(1);
    }
};
start();
