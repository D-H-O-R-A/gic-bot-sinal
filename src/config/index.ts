import { config } from 'dotenv';

config();

export const GIC_CONFIG = {
  RPC_URL: process.env.RPC_URL || 'https://rpc.gscscan.com',
  WSS_URL: process.env.WSS_URL || 'wss://wss.gscscan.com',
  CHAIN_ID: parseInt(process.env.CHAIN_ID || '3364'),
  FACTORY_ADDRESS: process.env.FACTORY_ADDRESS || '0x19A4293c6E94406F5756FCB2012c677F39e61D59',
  ROUTER_ADDRESS: process.env.ROUTER_ADDRESS || '0x283aE8d9a55E2995fd06953Cb211Ec39503042eC',
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  DB_URL: process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/gicbot',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379'
};