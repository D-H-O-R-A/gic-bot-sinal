const { GIC_CONFIG,providerwss,setupWebSocketListeners} = require('../config/env');
const {getTokenConfigDetails,getConfigFull} = require('../config/tools');
const {getSwapForRealtime,getPairDetails} = require("../config/subgraph")
const { Markup } = require('telegraf');
const {decodeinputswap} = require("../config/decode");
const {logger} = require('../config/logger');

const processedBlocks = new Set();

async function callSwapRealtime(ctx) {
  const check =await checkmonitoring(ctx,true)
  if(check)
  {
    try {
      setupWebSocketListeners(ctx);
      logger.info("🚀 Starting Swaps monitoring...");
      logger.info("🔍 Waiting for new Swaps...");
  
      await ctx.replyWithMarkdownV2(
        `🚀 **Starting Swaps monitoring\\.\\.\\.**\n\n🔍 Waiting for new Swaps\\.\\.\\.`
      );
  
      providerwss.on("block", async (blockNumber) => {
        if (processedBlocks.has(blockNumber)) return;
        processedBlocks.add(blockNumber);
  
        logger.info(`🔹 New block mined: ${blockNumber}`);
  
        try {
          const block = await providerwss.getBlockWithTransactions(1523337);
  
          if (block.transactions.some((tx) => tx.to?.toLowerCase() === GIC_CONFIG.ROUTER_ADDRESS.toLowerCase())) {
            const swap = block.transactions.filter(tx => tx.to?.toLowerCase() === GIC_CONFIG.ROUTER_ADDRESS.toLowerCase())
            for(let i =0;i<swap.length;i++){
              const inputdecode = decodeinputswap(swap[i].data)
              if(inputdecode.length>0){
                logger.info(`✅ Swap transaction detected in block ${blockNumber}`);
                await checknewswap(ctx, 1523337,inputdecode);
              }
            }
          }
        } catch (error) {
          logger.error("❌ Error processing block:", (error));
        }
      });
    } catch (error) {
      logger.error("❌ Error in swap monitoring:", (error));
      if (error.message.includes("bot was blocked by the user")) {
        logger.info("🚫 Bot was blocked by the user.");
        ctx.replyWithMarkdownV2("🚫 Bot was blocked by the user.")
        return;
      }
      ctx.replyWithMarkdownV2("Real\\-time error monitoring\\. Please contact the bot dev \\( \\@diegoorisderoa \\) or dev Gic Team and try again running using /startmonitoring");
      return;
    }
  }
}

async function checkmonitoring(ctx,x=false){
  const config = await getTokenConfigDetails(ctx);
  if(!config?.id){
    ctx.replyWithMarkdownV2("Real\\-time monitoring not configured\\. Try running /setconfig \\(your token id\\) \\(swap token id\\) \\(gif url\\)")
    if(x)
      return false;
  }else{
    return x?true:ctx.replyWithMarkdownV2("Real\\-time monitoring is configured\\!")
  }
}

async function checknewswap(ctx,block,inputdecode) {
  logger.info(JSON.stringify(inputdecode))
  const getListConfig = Object.values(await getConfigFull())
  logger.info(JSON.stringify(getListConfig))
  if(getListConfig.length==0){
    return;
  }
  const grouptosend = getListConfig.filter(gp => ((gp.tokenAddress).toLowerCase() == inputdecode[0] || (gp.tokenAddress).toLowerCase() == inputdecode[1]) && ((gp.swapToken).toLowerCase() == inputdecode[0] || (gp.swapToken).toLowerCase() == inputdecode[1]))
  logger.info("grouptosend:"+JSON.stringify(grouptosend))
  if(grouptosend.length==0){
    return;
  }
  logger.info("grouptosend:"+grouptosend)
  for(let i = 0;i<grouptosend.length;i++){
    const pairdetails = await getPairDetails(grouptosend[i].pairaddress);
    logger.info("send to group:"+ grouptosend[i])
    await sendwithtimeout(grouptosend[i],pairdetails,ctx,block)
  }
}

async function sendwithtimeout(grouptosend,pairdetails,ctx,block) {
  setTimeout(async ()=>{
    const swapdetails = await getSwapForRealtime(grouptosend.pairaddress)
    if(!swapdetails || !swapdetails?.data || !swapdetails?.data?.swaps || swapdetails?.data?.swap?.length === 0)
    {
      return logger.info("no details"+swapdetails+!swapdetails+ !swapdetails?.data+ !swapdetails?.data?.swap+ swapdetails?.data?.swap?.length === 0);
    }
    const data = swapdetails.data.swaps
    const isA01 = (pairdetails.data.pair.token0.id).toLowerCase() == (grouptosend.tokenAddress).toLowerCase() 
    const swap = data.filter(transaction => transaction.transaction.block == block && (isA01? (transaction.amount1In !== "0" && transaction.amount0Out !== "0") : (transaction.amount1Out !== "0" && transaction.amount0In !== "0")))
    logger.info("Data send with timeout:"+JSON.stringify(data)+","+JSON.stringify(swap)+","+isA01)
    if(swap.length > 0){
      for(let i = 0; i<swap.length;i++){
        let priceOperation = swap[i].amountUSD
        const price = (isA01 ? priceOperation/swap[i].amount0Out : priceOperation/swap[i].amount1Out);
        const msg = msgalertswap(
          grouptosend.tokenSymbol,
          grouptosend.swapTokenSymbol,
          (swap[i].id).replaceAll("-0",""),
          parseFloat(isA01? swap[i].amount1In : swap[i].amount1Out).toFixed(6),
          parseFloat(isA01? swap[i].amount0Out : swap[i].amount0In).toFixed(6),
          parseFloat(price).toFixed(6),
          parseFloat(priceOperation).toFixed(6),
        );
        logger.info("Ok1")
        if(!ctx){
          return msg.replaceAll(".", "\\.");
        }
        logger.info("Loginfook1:"+price+","+msg+","+priceOperation)
        logger.info("Ok2")
        const keyboard = Markup.inlineKeyboard([
          Markup.button.url('Check in GSCSCAN', `${GIC_CONFIG.EXPLORER}/tx/${(swap[i].id).replaceAll("-0","")}`),
        ]);
        const image = grouptosend.imagem;
        const imageUrl = image ? image : GIC_CONFIG.DEFAULT_GIF_URL;
        logger.info("Ok3")
        // Enviar a imagem com a legenda
        logger.info("Id:"+grouptosend.id)
        try{
          await ctx.telegram.sendAnimation(grouptosend.id, imageUrl, { 
            caption: msg.replaceAll(".", "\\."), 
            ...keyboard, 
            parse_mode: "MarkdownV2" 
          });
        }catch(e){
          logger.info("Error in sendwithtimeout: "+JSON.stringify(e))
          return ctx.replyWithMarkdownV2("Real\\-time monitoring was not configured correctly\\. Try again running /setconfig \\(main token id\\) \\(swap token id\\) \\(gif url\\)");
        }
      }
     }
    }, 5000);
}

const msgalertswap = (symbol, symbolPrice, txhash,totalA,totalB,priceusdt,priceOperation) => {7
  const tx = txhash.replaceAll("-0","")
  const response = `
🚨 \\*\\*New Trade Alert\\*\\* 🚨

📈 Price\\: $${priceusdt}
📈 Price Tx\\: $${priceOperation}
💸 Total ${symbol}\\: ${totalA}
💸 Total ${symbolPrice}\\: ${totalB}
TxId\\: ${tx.substr(0,6)}...${tx.substr(-6)}
────────────────────
`;
  return response.replaceAll("-","\\-");
};
  

module.exports = {callSwapRealtime,checkmonitoring};