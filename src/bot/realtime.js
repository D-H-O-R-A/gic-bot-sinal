const { GIC_CONFIG,providerwss,setupWebSocketListeners} = require('../config/env');
const {getTokenConfigDetails,isBuyTx,getTransactionLogs,getLogsAddress,getConfigFull} = require('../config/tools');
const BigNumber = require('bignumber.js'); // Certifique-se de instalar o BigNumber
const {getUSDTTOkenPrice} = require("../blockchain/contract")
const {getSwapForRealtime,getPairDetails} = require("../config/subgraph")
const { Markup } = require('telegraf');
const {decodeinputswap} = require("../config/logs");
const { fchown } = require('fs');

const processedBlocks = new Set();

async function callSwapRealtime(ctx) {
  var check =await checkmonitoring(ctx,true)
  if(check)
  {
    try {
      setupWebSocketListeners(ctx);
      console.log("🚀 Starting Swaps monitoring...");
      console.log("🔍 Waiting for new Swaps...");
  
      await ctx.replyWithMarkdownV2(
        `🚀 **Starting Swaps monitoring\\.\\.\\.**\n\n🔍 Waiting for new Swaps\\.\\.\\.`
      );
  
      providerwss.on("block", async (blockNumber) => {
        if (processedBlocks.has(blockNumber)) return;
        processedBlocks.add(blockNumber);
  
        console.log(`🔹 New block mined: ${blockNumber}`);
  
        try {
          const block = await providerwss.getBlockWithTransactions(blockNumber);
  
          if (block.transactions.some((tx) => tx.to?.toLowerCase() === GIC_CONFIG.ROUTER_ADDRESS.toLowerCase())) {
            const swap = block.transactions.filter(tx => tx.to?.toLowerCase() === GIC_CONFIG.ROUTER_ADDRESS.toLowerCase())
            for(let i =0;i<swap.length;i++){
              var inputdecode = decodeinputswap(swap[i].data)
              if(inputdecode.length>0){
                console.log(`✅ Swap transaction detected in block ${blockNumber}`);
                await checknewswap(ctx, blockNumber,inputdecode);
              }
            }
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
}

async function checkmonitoring(ctx,x=false){
  const config = await getTokenConfigDetails(ctx);
  if(!config?.id){
    ctx.replyWithMarkdownV2("Real-time monitoring not configured. Try running /setconfig (your token id) (swap token id) (gif url)")
    if(x)
      return false;
  }else{
    return x?true:ctx.replyWithMarkdownV2("Real-time monitoring is configured!")
  }
}

async function checknewswap(ctx,block,inputdecode) {
  console.log(inputdecode)
  const getListConfig = Object.values(await getConfigFull())
  console.log(getListConfig)
  if(getListConfig.length==0){
    return;
  }
  const grouptosend = getListConfig.filter(gp => (gp.tokenAddress == inputdecode[0] || gp.tokenAddress == inputdecode[1]) && (gp.swapToken == inputdecode[0] || gp.swapToken == inputdecode[1]))
  if(grouptosend.length==0){
    return;
  }
  console.log("grouptosend:",grouptosend)
  for(let i = 0;i<grouptosend.length;i++){
    const pairdetails = await getPairDetails(grouptosend[i].pairaddress);
    console.log("send to group:", grouptosend[i])
    await sendwithtimeout(grouptosend[i],pairdetails,ctx,block)
  }
}

async function sendwithtimeout(grouptosend,pairdetails,ctx,block) {
  setTimeout(async ()=>{
    var swapdetails = await getSwapForRealtime(grouptosend.pairaddress)
    if(!swapdetails || !swapdetails?.data || !swapdetails?.data?.swaps || swapdetails?.data?.swap?.length === 0)
    {
      return console.log("no details",swapdetails,!swapdetails, !swapdetails?.data, !swapdetails?.data?.swap, swapdetails?.data?.swap?.length === 0);
    }
    const data = swapdetails.data.swaps
    const isA01 = (pairdetails.data.pair.token0.id).toLowerCase() == (grouptosend.tokenAddress).toLowerCase() 
    const swap = data.filter(transaction => transaction.transaction.block == block && (isA01? (transaction.amount1In > 0 && transaction.amount0Out >0) : (transaction.amount1Out > 0 && transaction.amount0In >0)))
    if(swap.length > 0){
      for(let i = 0; i<swap.length;i++){
        let priceOperation = swap[i].amountUSD
        const price = (isA01 ? priceOperation/swap[i].amount0Out : priceOperation/swap[i].amount1Out);
        const msg = msgalertswap(
          grouptosend.tokenSymbol,
          grouptosend.swapTokenSymbol,
          swap[i].id,
          parseFloat(isA01? swap[i].amount1In : swap[i].amount1Out).toFixed(6),
          parseFloat(isA01? swap[i].amount0Out : swap[i].amount0In).toFixed(6),
          parseFloat(price).toFixed(6),
          parseFloat(priceOperation).toFixed(6),
        );
        console.log("Ok1")
        if(!ctx){
          return msg.replaceAll(".", "\\.");
        }
        console.log("Ok2")
        const keyboard = Markup.inlineKeyboard([
          Markup.button.url('Check in GSCSCAN', `${GIC_CONFIG.EXPLORER}/tx/${(swap[i].id).replaceAll("-0","")}`),
        ]);
        const image = grouptosend.imagem;
        const imageUrl = image ? image : GIC_CONFIG.DEFAULT_IMAGE_URL;
        console.log("Ok3")
        // Enviar a imagem com a legenda
        console.log("Id:",grouptosend.id)
        await ctx.telegram.sendAnimation(grouptosend.id, imageUrl, { 
            caption: msg.replaceAll(".", "\\."), 
            ...keyboard, 
            parse_mode: "MarkdownV2" 
        });
      }
     }
    }, 5000);
}

const msgalertswap = (symbol, symbolPrice, txhash,totalA,totalB,priceusdt,priceOperation) => {
  const response = `
🚨 \\*\\*New Trade Alert\\*\\* 🚨

📈 Price: $${priceusdt}
📈 Price Tx: $${priceOperation}
💸 Total ${symbol}: ${totalA}
💸 Total ${symbolPrice}: ${totalB}
TxId: ${txhash.replaceAll("-0","")}
────────────────────
\\#GIC \\#${symbol} \\#TradingAlert
`;
  return response.replaceAll("-","\\-");
};
  

module.exports = {callSwapRealtime,checkmonitoring};