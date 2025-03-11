import { Telegraf } from 'telegraf';
import { GIC_CONFIG } from '../config';
import { setupCommands } from './commands';
import { logger } from '../utils/logger';
import { Redis } from 'ioredis';

export const redis = new Redis(GIC_CONFIG.REDIS_URL);

export const initBot = () => {
  const bot = new Telegraf(GIC_CONFIG.BOT_TOKEN);

  // Middleware
  bot.use(async (ctx, next) => {
    logger.info(`Update ${ctx.update.update_id} received`);
    await next();
  });

  // Rate limiting
  bot.use(async (ctx, next) => {
    const key = `rate_limit:${ctx.from?.id || ctx.chat?.id}`;
    const current = await redis.incr(key);
    if (current > 10) {
      await ctx.reply('Rate limit exceeded. Please wait.');
      return;
    }
    if (current === 1) await redis.expire(key, 60);
    await next();
  });

  setupCommands(bot);

  bot.catch((err) => {
    logger.error('Bot error:', err);
  });

  return bot;
};