import { initBot } from './bot/bot';
import { BlockchainListener } from './blockchain/listener';
import { GIC_CONFIG } from './config';
import { logger } from './utils/logger';
import 'reflect-metadata';

const start = async () => {
  try {
    const bot = initBot();
    const listener = new BlockchainListener();
    
    await bot.launch();
    await listener.start();

    logger.info(`Bot started on chain ${GIC_CONFIG.CHAIN_ID}`);
    logger.info('Listening for swaps...');
  } catch (error) {
    logger.error('Failed to start:', error);
    process.exit(1);
  }
};

start();