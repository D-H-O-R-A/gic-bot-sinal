const { GIC_CONFIG,web3wss,web3rpc} = require('../config/env');
const {getTokenConfig} = require('../config/tools');
const SWAP_METHOD_IDS = ['0x8803dbee', '0x38ed1739', '0x5c11d795']; // IDs de métodos de swap comuns
const {TradeAlert} = require('../bot/messages');

async function callSwapRealtime(ctx){
   /* 
    decodeTransaction({
        from: '0x6081c745ffb993229de179ae9e7ae19a2b0be354',
        gas: 160708n,
        gasPrice: 1000000007n,
        maxFeePerGas: 1000000007n,
        maxPriorityFeePerGas: 1000000007n,
        hash: '0x9056eaa5c2fe10906f98cf6adb5dafead09f8bc448d405c8ed771d32d12b6e3f',
        input: '0x7ff36ab5000000000000000000000000000000000000000000000014458d3347d08d108300000000000000000000000000000000000000000000000000000000000000800000000000000000000000006081c745ffb993229de179ae9e7ae19a2b0be3540000000000000000000000000000000000000000000000000000000067d0bff30000000000000000000000000000000000000000000000000000000000000002000000000000000000000000b47a97e4c65a38f7759d17c6414292e498a01538000000000000000000000000c51f50f759f10df17a87e6b9afea25ad07660553',
        nonce: 81n,
        to: '0x283ae8d9a55e2995fd06953cb211ec39503042ec',
        value: 1000000000000000000000n,
        type: 2n,
        accessList: [],
        chainId: 3364n,
        v: 0n,
        r: '0x4ef43869d08c4bc0872276504944a6b611b57c86f0fae77fdaa9d356fa190a8e',
        s: '0x4256f97a9bf0798540ce17bcf0aa26fee589398c278d112ae0194809b2fd64cb',
        data: '0x7ff36ab5000000000000000000000000000000000000000000000014458d3347d08d108300000000000000000000000000000000000000000000000000000000000000800000000000000000000000006081c745ffb993229de179ae9e7ae19a2b0be3540000000000000000000000000000000000000000000000000000000067d0bff30000000000000000000000000000000000000000000000000000000000000002000000000000000000000000b47a97e4c65a38f7759d17c6414292e498a01538000000000000000000000000c51f50f759f10df17a87e6b9afea25ad07660553'
      }.hash)
    var t = await getTokenConfig()*/
console.log("🚀 Starting Swaps monitoring...");
console.log("🔍 Waiting for new Swaps...");
console.log("🔍 Token configured for monitoring:", t);
await ctx.replyWithMarkdownV2('🚀 **Starting Swaps monitoring\\.\\.\\.**\n\n🔍 Waiting for new Swaps\\.\\.\\.\n\n🔍 Token configured for monitoring:'+t);
/*
try {
    const subscription = await web3wss.eth.subscribe('pendingTransactions');
    
    subscription.on('data', async (txHash) => {
      try {
        const tx = await web3wss.eth.getTransaction(txHash);
        if (tx && tx.to && tx.to.toLowerCase() === GIC_CONFIG.ROUTER_ADDRESS.toLowerCase()) {
            const decode = await decodeTransaction(tx.hash);
            const msg = TradeAlert(decode.token, decode.price, decode.priceToken, decode.symbol, decode.symbolPrice, tx.hash);
            await ctx.replyWithMarkdownV2(msg);
        }
      } catch (error) {
        console.error('Erro ao obter transação:', error);
      }
    });

    subscription.on('error', err => {
      console.error('Erro na subscription:', err);
    });

    console.log('Monitorando transações...');
    
  } catch (error) {
    console.error('Erro ao iniciar monitoramento:', error);
  }
    */
}


const axios = require('axios');

// Função para fazer a requisição GET com Axios
const getTransactionLogs = async (txid) => {
  try {
    const response = await axios.get(`https://gscscan.com/api/v2/transactions/${txid}/logs`, {
      headers: {
        'accept': 'application/json',
      }
    });

    // Retorna a resposta da API
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar os logs da transação:', error);
    throw error;
  }
};

async function decodeTransaction(txid){
    const logs = await getTransactionLogs(txid)
    console.log(logs)
    return {token: logs.items[0].address, price: logs.items[0].decoded.parameters[1].value, priceToken: logs.items[0].address, symbol: logs.items[0].topics[2], symbolPrice: logs.items[0].topics[3]}
}

module.exports = {callSwapRealtime};