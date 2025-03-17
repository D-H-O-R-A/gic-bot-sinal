const Web3 = require('web3').Web3;
const { ethers } = require("ethers");
const {RouterABI, FactoryABI} = require('../blockchain/abi');

require('dotenv').config();

const GIC_CONFIG = {
  RPC_URL: process.env.RPC_URL || 'https://rpc.gscscan.com',
  WSS_URL: process.env.WSS_URL || 'wss://wss.gscscan.com',
  WS_URL: process.env.WS_URL || 'ws://wss.gscscan.com',
  CHAIN_ID: parseInt(process.env.CHAIN_ID || '3364'),
  FACTORY_ADDRESS: process.env.FACTORY_ADDRESS || '0x19A4293c6E94406F5756FCB2012c677F39e61D59',
  ROUTER_ADDRESS: process.env.ROUTER_ADDRESS || '0x283aE8d9a55E2995fd06953Cb211Ec39503042eC',
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  DB_URL: process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/gicbot',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  EXPLORER: process.env.EXPLORER || 'https://gscscan.com',
  USDT_ADDRESS: process.env.USDT_ADDRESS || '0x230c655Bb288f3A5d7Cfb43a92E9cEFebAAB46eD',
  GIC_ADDRESS: process.env.GIC_ADDRESS || '0xB47a97E4c65A38F7759d17C6414292E498A01538',
  DEFAULT_IMAGE_URL: process.env.DEFAULT_IMAGE_URL || "https://files.catbox.moe/anidbu.mp4",
  API_EXPLORER: process.env.API_EXPLORER || "https://gscscan.com/api/v2"
};

// Corrigido para a nova forma de instanciar o provider
const web3rpc = new Web3(GIC_CONFIG.RPC_URL);  // Web3 já aceita diretamente a URL do RPC
var providerwss = new ethers.providers.WebSocketProvider(GIC_CONFIG.WSS_URL);

const factoryContract = new web3rpc.eth.Contract(FactoryABI, GIC_CONFIG.FACTORY_ADDRESS);
const routerContract = new web3rpc.eth.Contract(RouterABI, GIC_CONFIG.ROUTER_ADDRESS);


const setupWebSocketListeners = (ctx,t) => {
  providerwss._websocket.on("open", async () => {
    console.log("[WSS] Conectado ao WebSocket");
    await ctx.replyWithMarkdownV2(`Websocket connection successfully completed on the blockchain! `)
  });

  providerwss._websocket.on("close", async (code, reason) => {
    if(!t){
      console.log(`[WSS] Desconectado do WebSocket. Código: ${code}, Motivo: ${reason}`);
      console.log("[WSS] Tentando reconectar...");
      await ctx.replyWithMarkdownV2(`\\[WSS\\] Disconnected from WebSocket\\. Code\\: ${code.replace(/[_*](.*?)[_*]/g, '$1')}\\, Reason\\: ${reason}`);
    }
    reconnectWebSocket(ctx);
  });

  providerwss._websocket.on("error", (err) => {
    console.error("[WSS] Erro no WebSocket:", err);
  });
};

const reconnectWebSocket = (ctx) => {
  setTimeout(() => {
    console.log("[WSS] Reiniciando conexão WebSocket...");
    providerwss = new ethers.providers.WebSocketProvider(GIC_CONFIG.WSS_URL);
    setupWebSocketListeners(ctx,true);
  }, 5000);
};

// Função para verificar status da conexão WSS
// Função para criar timeout
const withTimeout = (promise, ms = 5000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
  ]);

// Função para verificar status da conexão WSS
const checkWSSConnection = async () => {
  try {
    await withTimeout(providerwss.getBlockNumber());
    return "✅";
  } catch (error) {
    return "❌";
  }
};

// Função para verificar status da conexão WS (WebSocket)
const checkWSConnection = async () => {
  try {
    const wsProvider = new Web3.providers.WebsocketProvider(GIC_CONFIG.WS_URL);
    const wsWeb3 = new Web3(wsProvider);
    await withTimeout(wsWeb3.eth.net.isListening());
    return "✅";
  } catch (error) {
    return "❌";
  }
};

// Função para verificar status da conexão RPC
const checkRPCConnection = async () => {
  try {
    await withTimeout(web3rpc.eth.getBlockNumber());
    return "✅";
  } catch (error) {
    return "❌";
  }
};

const checkAPIConnection = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(GIC_CONFIG.API_EXPLORER+"/blocks/0");
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`⚠️ API retornou status: ${response.status} - ${response.statusText}`);
      return `❌`;
    }

    return `✅`;
  } catch (error) {
    console.log(error);

    // Verifica se há um 'cause' no erro e extrai informações relevantes
    const cause = error.cause || error;

    if (cause.name === "AbortError") {
      console.error("⏳ Tempo limite da API expirado.");
      return "❌ \\(Timeout\\)";
    }

    if (cause.code === "ERR_TLS_CERT_ALTNAME_INVALID") {
      console.error("⚠️ Erro de certificado SSL: Hostname inválido.");
      return `❌ \\(Error SSL: ${cause.code}\\)`;
    }

    // Se não for nenhum dos casos acima, exibe uma mensagem genérica
    console.error("❌ Error to connect api:", cause.message);
    return `❌ \\(Error: ${cause.code || cause.message}\\)`;
  }
};

const checkStatus = {
  ws: checkWSConnection,
  wss: checkWSSConnection,
  rpc: checkRPCConnection,
  api: checkAPIConnection
}

module.exports = { GIC_CONFIG, providerwss, web3rpc,factoryContract,routerContract,checkStatus,setupWebSocketListeners};
