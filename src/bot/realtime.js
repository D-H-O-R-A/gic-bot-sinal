const { GIC_CONFIG,providerwss,setupWebSocketListeners} = require('../config/env');
const {getTokenConfigDetails,isBuyTx,getTransactionLogs,getLogsAddress} = require('../config/tools');
const {TradeAlert,statusnode} = require('../bot/messages');
const BigNumber = require('bignumber.js'); // Certifique-se de instalar o BigNumber
const {getUSDTTOkenPrice} = require("../blockchain/contract")
const {getSwapForRealtime} = require("../config/subgraph")
const { Markup } = require('telegraf');

const processedBlocks = new Set();
let oldTransactions = new Map();
const groupContexts = new Map(); // Armazena os contextos de cada grupo

async function callSwapRealtime(ctx) {
  try {
    setupWebSocketListeners(ctx);
    const tokenInfo = await getTokenConfigDetails(ctx);

    console.log("🚀 Starting Swaps monitoring...");
    console.log("🔍 Waiting for new Swaps...");
    console.log("🔍 Token configured for monitoring:", tokenInfo.tokenAddress);

    await ctx.replyWithMarkdownV2(
      `🚀 **Starting Swaps monitoring\\.\\.\\.**\n\n🔍 Waiting for new Swaps\\.\\.\\.\n\n🔍 Token configured for monitoring: ${tokenInfo.tokenAddress}`
    );
    groupContexts.set(ctx.chat.id, ctx);

    providerwss.on("block", async (blockNumber) => {
      if (processedBlocks.has(blockNumber)) return;
      processedBlocks.add(blockNumber);

      console.log(`🔹 New block mined: ${blockNumber}`);

      try {
        const block = await providerwss.getBlockWithTransactions(blockNumber);

        if (block.transactions.some((tx) => tx.to?.toLowerCase() === GIC_CONFIG.ROUTER_ADDRESS.toLowerCase())) {
          console.log(`✅ Swap transaction detected in block ${blockNumber}`);
          await checknewswap(ctx, tokenInfo, blockNumber);
        }
      } catch (error) {
        console.error("❌ Error processing block:", error);
      }
    });
  } catch (error) {
    console.error("❌ Error initializing swap monitoring:", error);
    if (error.message.includes("bot was blocked by the user")) {
      console.log("🚫 Bot was blocked by the user.");
      return;
    }
    await callSwapRealtime(ctx)
  }
}

async function checknewswap(ctx,params,block) {
  console.log(params)
  setTimeout(async ()=>{
    var swapdetails = await getSwapForRealtime(params.pairaddress)
    if(!swapdetails || !swapdetails?.data || !swapdetails?.data?.swaps || swapdetails?.data?.swap?.length === 0)
    {
      return console.log("no details",swapdetails,!swapdetails, !swapdetails?.data, !swapdetails?.data?.swap, swapdetails?.data?.swap?.length === 0);
    }
    const data = swapdetails.data.swaps
    console.log(data)
    const swap = data.filter(transaction => transaction.transaction.block == block && transaction.amount1Out > 0 && transaction.amount0In >0)
    console.log(data[0],block)
    if(swap.length > 0){
      for(let i = 0; i<swap.length;i++){
        let price = swap[i].amountUSD
        const msg = TradeAlert(
          params.tokenSymbol,
          params.swapTokenSymbol,
          swap[i].id,
          swap[i].amount1Out,
          swap[i].amount0In,
          price
        );
        console.log("Ok1")
        if(!ctx){
          return msg.replaceAll(".", "\\.");
          console.log("Ok12")
        }
        console.log("Ok2")
        const keyboard = Markup.inlineKeyboard([
          Markup.button.url('Check in GSCSCAN', `${GIC_CONFIG.EXPLORER}/tx/${(swap[i].id).replaceAll("-0","")}`),
        ]);
        const image = params.imagem;
        const imageUrl = image ? image : GIC_CONFIG.DEFAULT_IMAGE_URL;
        console.log("Ok3")
        // Enviar a imagem com a legenda
        await ctx.replyWithAnimation(imageUrl, { caption: msg.replaceAll(".", "\\."),...keyboard, parse_mode: "MarkdownV2" });
      }
  
    }
  }, 5000);

}

async function checkLog(ctx, info, blockNumber) {
  try {
    console.log("🔍 Checking logs for block:", blockNumber);

    const pairAddress = info.pairaddress;
    const logs = await getLogsAddress(pairAddress);
    console.log("📥 Logs retrieved for address:", pairAddress);

    if (!logs || !logs.items || logs.items.length === 0) {
      console.log("⚠️ No logs found for this block.");
      return;
    }

    const priceUSDT = await getUSDTTOkenPrice(info.tokenAddress);
    console.log("Checking price...")

    // Filtrando transações relevantes
    const filteredLogs = logs.items.filter((item) => {
      if (
        ((item.decoded.method_call).toLowerCase()).includes("swap") &&
        item.block_number == blockNumber &&
        isBuyTx(item) != null
      ) {
        if (oldTransactions.get(item.transaction_hash)) {
          return false; // Ignora transações já processadas
        }
        oldTransactions.set(item.transaction_hash, false);
        return true;
      }
      return false;
    });
    console.log("filter Tx logs...")
    if(filteredLogs.length === 0){
      oldTransactions.clear();
      if(!ctx){
        return "Is no buy tx.";
      }
      await checkLog(ctx, info, blockNumber)
    }
    for (const log of filteredLogs) {
      if (log.decoded.parameters.length === 6 && log.block_number == blockNumber) {
        const logTx = await getTransactionLogs(log.transaction_hash);
        console.log("Geting ")
        if (!logTx.items || logTx.items.length < 3) {
          console.warn("⚠️ Transaction logs incomplete:", log.transaction_hash);
          continue;
        }

        console.log(
          `🔄 Processing TxID: ${log.transaction_hash} | Block: ${logTx.items[0].block_number}`
        );

        const blockTxNumber = logTx.items[0].block_number;
        const txHash = log.transaction_hash;

        if (
          blockTxNumber === blockNumber &&
          !oldTransactions.get(txHash) &&
          isValidTransaction(log.decoded.parameters)
        ) {
          oldTransactions.set(txHash, true);

          const reserveTokenA = new BigNumber(log.decoded.parameters[2].value);
          const reserveTokenB = new BigNumber(
            logTx.items[2].decoded.parameters[2].value
          );

          const msg = TradeAlert(
            reserveTokenB.dividedBy(reserveTokenA),
            info.tokenSymbol,
            info.swapTokenSymbol,
            txHash,
            parseFloat(reserveTokenB.dividedBy(10 ** 18)).toFixed(6),
            parseFloat(reserveTokenA.dividedBy(10 ** 18)).toFixed(6),
            priceUSDT
          );
          if(!ctx){
            return msg.replaceAll(".", "\\.");
          }
          for (let ctx of groupContexts.values()) {
            const keyboard = Markup.inlineKeyboard([
              Markup.button.url('Check in GSCSCAN', `${GIC_CONFIG.EXPLORER}/tx/${txHash}`),
            ]);
            const image = info.imagem;
            const imageUrl = image ? image : GIC_CONFIG.DEFAULT_IMAGE_URL;
            // Enviar a imagem com a legenda
            await ctx.replyWithAnimation(imageUrl, { caption: msg.replaceAll(".", "\\."),...keyboard, parse_mode: "MarkdownV2" });
          }
        } else {
          console.log("🚫 Skipping Tx:", log.transaction_hash);
        }
      }else{
        console.log(log.decoded.parameters.length === 6 && log.block_number == blockNumber)
        console.log(log.decoded.parameters, log.block_number, blockNumber, log)
      }
    }

    // Limpeza da memória para evitar crescimento desnecessário do objeto
    oldTransactions.clear();
  } catch (error) {
    console.error("❌ Erro ao verificar logs:", error.message);
  }
}

/**
 * Valida se a transação tem parâmetros corretos para ser processada.
 */
function isValidTransaction(parameters) {
  return (
    parameters[2].value !== "0" &&
    !parameters[2].value.includes("0x") &&
    parameters[3].value !== "0" &&
    !parameters[3].value.includes("0x")
  );
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
  

module.exports = {callSwapRealtime,checkLog};