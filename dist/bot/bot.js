"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBot = exports.redis = void 0;
const telegraf_1 = require("telegraf");
const config_1 = require("../config");
const commands_1 = require("./commands");
const logger_1 = require("../utils/logger");
const ioredis_1 = require("ioredis");
exports.redis = new ioredis_1.Redis(config_1.GIC_CONFIG.REDIS_URL);
const initBot = () => {
    const bot = new telegraf_1.Telegraf(config_1.GIC_CONFIG.BOT_TOKEN);
    // Middleware
    bot.use(async (ctx, next) => {
        logger_1.logger.info(`Update ${ctx.update.update_id} received`);
        await next();
    });
    // Rate limiting
    bot.use(async (ctx, next) => {
        const key = `rate_limit:${ctx.from?.id || ctx.chat?.id}`;
        const current = await exports.redis.incr(key);
        if (current > 10) {
            await ctx.reply('Rate limit exceeded. Please wait.');
            return;
        }
        if (current === 1)
            await exports.redis.expire(key, 60);
        await next();
    });
    (0, commands_1.setupCommands)(bot);
    bot.catch((err) => {
        logger_1.logger.error('Bot error:', err);
    });
    return bot;
};
exports.initBot = initBot;
