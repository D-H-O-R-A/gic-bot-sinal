const { GIC_CONFIG,providerwss} = require('../config/env');
const {getTokenConfigDetails,isBuyTx} = require('../config/tools');
const axios = require('axios');
const {TradeAlert,statusnode} = require('../bot/messages');
const BigNumber = require('bignumber.js'); // Certifique-se de instalar o BigNumber
const {getUSDTTOkenPrice} = require("../blockchain/contract")

var old = []

async function callSwapRealtime(ctx){
  var info = await getTokenConfigDetails(ctx)
  console.log("🚀 Starting Swaps monitoring...");
  console.log("🔍 Waiting for new Swaps...");
  console.log("🔍 Token configured for monitoring:", info.tokenAddress);
  await ctx.replyWithMarkdownV2('🚀 **Starting Swaps monitoring\\.\\.\\.**\n\n🔍 Waiting for new Swaps\\.\\.\\.\n\n🔍 Token configured for monitoring:'+info.tokenAddress);
  // Inscreve-se para receber os eventos de novos blocos

  try {
    providerwss.on("block", async (blockNumber) => {
      console.log('Novo bloco minerado:', blockNumber);
    
      try {
        console.time("Verificação");
    
        // Obtendo o bloco detalhado com transações
        const block = await providerwss.getBlockWithTransactions(blockNumber);
        console.log(block)
        // Verifica se há alguma transação no bloco que corresponde ao contrato desejado
        const found = block.transactions.some(tx => 
          tx.to && tx.to.toLowerCase() === GIC_CONFIG.ROUTER_ADDRESS.toLowerCase()
        );
    
        if (found) {
          console.log(`Transação encontrada no bloco ${block.number}`);
          await checkLog(ctx, info, block.number);
        }
    
        console.timeEnd("Verificação"); // Mostra o tempo de execução para debug
      } catch (error) {
        console.error("Erro ao processar o bloco:", error);
      }
    });
  } catch (error) {
    console.error('Erro ao iniciar monitoramento:', error);
    await ctx.replyWithMarkdownV2(`Oops\\.\\.\\. We\\’re having trouble fetching the real-time swap data.\\. Please try again later—we’re on it at transaction speed\\! ⚡
Getting Technical details\\.\\.\\. \\(Check /devdetails to get RPC\\, API\\, WS and WSS URLs\\)\\.
    `);
    return statusnode(ctx)
  }
    
}

const getTransactionLogs = async (txid) => {
  try {
    const response = await axios.get(`${GIC_CONFIG.API_EXPLORER}/transactions/${txid}/logs`, {
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


const getLogsAddreess = async (address) =>{
  try {
    const response = await axios.get(`${GIC_CONFIG.API_EXPLORER}/addresses/${address}/logs`, {
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
}

async function checkLog(ctx,info, blocknumber) {
  var processedTxs;
  console.log("Checking")
  const pairaddress = info.pairaddress;
  var logs = await getLogsAddreess(pairaddress)
  console.log("Get Logs")

  const fi = logs.items.filter(async item => {
    if (item.decoded.method_call.includes("Swap") && item.block_number === blocknumber && isBuyTx(item) != null) {
      // Verificar se o hash da transação já foi processado
      if (processedTxs.has(item.transaction_hash)) {
        return false; // Ignora a transação se ela já foi processada
      }
      // Adiciona o hash da transação ao conjunto de processadas
      processedTxs.add(item.transaction_hash);
      return true; // Inclui a transação no resultado
    }
    return false;
  });
  const priceUSDT = await getUSDTTOkenPrice(info.tokenAddress)

  for(let i = 0; i<fi.length; i++){
    console.log(fi[i].decoded.parameters.length)
    if(fi[i].decoded.parameters.length===6){
      var logstx = await getTransactionLogs(fi[i].transaction_hash)
      console.log("TxId:",fi[i].transaction_hash,"Block number tx:",logstx.items[0].block_number, "block number:", blocknumber)
      if(logstx.items[0].block_number ==blocknumber&& old[fi[i].transaction_hash]==undefined&&fi[i].decoded.parameters[2].value != "0" && !(fi[i].decoded.parameters[2].value).includes("0x") && fi[i].decoded.parameters[3].value != "0" && !(fi[i].decoded.parameters[3].value).includes("0x")){
        old = { ...old, [`${fi[i].transaction_hash}`]: true }; 
        var reserveTokenA = new BigNumber(fi[i].decoded.parameters[2].value);
        var reserveTokenB = new BigNumber(logstx.items[2].decoded.parameters[2].value);
        console.log(fi[i].decoded.parameters)
        const msg = TradeAlert(reserveTokenB.dividedBy(reserveTokenA), info.tokenSymbol, info.swapTokenSymbol, fi[i].transaction_hash, parseFloat(reserveTokenB/10**18).toFixed(6), parseFloat(reserveTokenA/10**18).toFixed(6),priceUSDT);
        await ctx.replyWithMarkdownV2(msg.replaceAll('.','\\.'));
      }else{
        console.log(fi[i].decoded.parameters)
        console.log(fi[i].transaction_hash)
      }
    }
  }
  old={};
}

/*
// Função para fazer a requisição GET com Axios

//use to send details in realtime
const msg = TradeAlert(decode.price, decode.priceToken, decode.symbol, decode.symbolPrice, tx.hash);
await ctx.replyWithMarkdownV2(msg.replaceAll('.','\\.'));

const getTransaction = async (txid) => {
  try {
    const response = await axios.get(`${GIC_CONFIG.API_EXPLORER}/transactions/${txid}`, {
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

const decodeTransaction = async (tx,info) => {
  var logs = await getTransactionLogs(tx)
  var tx = await getTransaction(tx)
  var details = isBuyTx(logs.items)
  if(details){
    var pricetoken=info.tokenAddress == tx.decoded_input.parameters[1].value[0] ? tx.decoded_input.parameters[1].value[0] : tx.decoded_input.parameters[1].value[1]
    var a1 = new BigNumber(details.amount1In)
    var a0 = new BigNumber(details.amount0Out)
    return {
      token: info.tokenAddress,
      price:  a0.dividedBy(a1),
      totalToken2Trade: a1,
      totalToken1Trade: a0,
      priceToken: pricetoken,
      symbol: info.tokenSymbol,
      symbolPrice: (await getTokenInfo(pricetoken)).symbol
    }
  }else{
    console.log("is sell, to next tx..")
    return null
  }
}
*/

/* --teste---
  var txteste = await decodeTransaction("0xef8162e371286b4ef30ead78b2314f89f25968b023696d7f0a5f305f5adcf371",info)
      const msg = TradeAlert(txteste.price, txteste.priceToken, txteste.symbol, txteste.symbolPrice, "0xef8162e371286b4ef30ead78b2314f89f25968b023696d7f0a5f305f5adcf371");
      await ctx.replyWithMarkdownV2(msg.replaceAll('.','\\.'));
*/
  

module.exports = {callSwapRealtime};