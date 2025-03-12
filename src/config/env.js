const Web3 = require('web3').Web3;
const { ethers } = require("ethers");
const {RouterABI, FactoryABI} = require('../blockchain/abi');

require('dotenv').config();

const GIC_CONFIG = {
  RPC_URL: process.env.RPC_URL || 'https://rpc.gscscan.com',
  WSS_URL: process.env.WSS_URL || 'wss://wss.gscscan.com',
  CHAIN_ID: parseInt(process.env.CHAIN_ID || '3364'),
  FACTORY_ADDRESS: process.env.FACTORY_ADDRESS || '0x19A4293c6E94406F5756FCB2012c677F39e61D59',
  ROUTER_ADDRESS: process.env.ROUTER_ADDRESS || '0x283aE8d9a55E2995fd06953Cb211Ec39503042eC',
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  DB_URL: process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/gicbot',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  EXPLORER: process.env.EXPLORER || 'https://gscscan.com',
  USDT_ADDRESS: process.env.USDT_ADDRESS || '0x230c655Bb288f3A5d7Cfb43a92E9cEFebAAB46eD',
  GIC_ADDRESS: process.env.GIC_ADDRESS || '0xB47a97E4c65A38F7759d17C6414292E498A01538',
  DEFAULT_IMAGE_URL: process.env.DEFAULT_IMAGE_URL || "https://files.catbox.moe/anidbu.mp4"
};

// Corrigido para a nova forma de instanciar o provider
const web3rpc = new Web3(GIC_CONFIG.RPC_URL);  // Web3 já aceita diretamente a URL do RPC
const providerwss = new ethers.providers.WebSocketProvider(GIC_CONFIG.WSS_URL);

const factoryContract = new web3rpc.eth.Contract(FactoryABI, GIC_CONFIG.FACTORY_ADDRESS);
const routerContract = new web3rpc.eth.Contract(RouterABI, GIC_CONFIG.ROUTER_ADDRESS);

module.exports = { GIC_CONFIG, providerwss, web3rpc,factoryContract,routerContract };
