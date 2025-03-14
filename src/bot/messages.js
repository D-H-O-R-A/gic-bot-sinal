const { Markup } = require('telegraf');
const {isEthereumToken, getTokenConfig} = require('../config/tools');
const path = require('path');
const fs = require('fs');
const {oneGetTokenMessage,twogetTokenMessage} = require('./functions.messages');
const { GIC_CONFIG,checkStatus } = require('../config/env');

const Analytics = (tokenAddress, currentPrice, hv24, symbol, lastTX) => {
  const response = `📊 **Token Analytics** 📊

🪙 Token: \`${tokenAddress}\` (${symbol})
💰 Current Price: $${currentPrice}
📈 24h Volume: ${hv24} ${symbol}
`;
  return response;
};

const TradeAlert = (price, symbol, symbolPrice, txhash,totalA,totalB,priceusdt) => {
  const response = `
🚨 \\*\\*New Trade Alert\\*\\* 🚨
────────────────────
🪙 Main Token: ${symbol}
🪙 Price Token: ${symbolPrice}
📈 Price: $${priceusdt}
💸 Total ${symbol}: ${totalA}
💸 Total ${symbolPrice}: ${totalB}
TxId: ${GIC_CONFIG.EXPLORER}/tx/${txhash}
────────────────────
\\#GIC \\#${symbol} \\#TradingAlert
`;
  return response;
};

async function devdetails(ctx) {
  const msg = `Technical  Details\\:
  
  RPC URL\\: ${GIC_CONFIG.RPC_URL}
  API GSCSCAN URL\\: ${GIC_CONFIG.API_EXPLORER}
  WSS URL\\: ${GIC_CONFIG.WSS_URL}
  WS URL\\: ${GIC_CONFIG.WS_URL}`
  return await ctx.replyWithMarkdownV2((msg.replaceAll(".","\\.")).replaceAll(":","\\:"))
}

async function statusnode(ctx) {
  await ctx.replyWithMarkdownV2("Checking\\.\\.\\. this operation can take up to 5s")
  const nodeMSG = `Status Node Connection GIC\\:
  
  WSS\\: ${await checkStatus.wss()}
  WS\\: ${await checkStatus.ws()}
  RPC\\: ${await checkStatus.rpc()}
  API GSCSCAN\\: ${await checkStatus.api()}
  ` 
  await ctx.replyWithMarkdownV2(nodeMSG)
  if(nodeMSG.includes("❌"))
    return await ctx.replyWithMarkdownV2("NOTICE\\: Services marked with ❌ are currently under maintenance by the GIC dev team\\. We\\'re working to enhance performance and ensure the best blockchain experience for our users\\. Thank you for your patience\\! 🚀")
}

async function startCommand(ctx) {
    const welcomeMessage = `🚀 **GIC Blockchain Trading Bot** 🚀
  
  📊 Real\\-time trading signals for GSwap DEX
  🔔 Get instant swap notifications
  📈 Track token prices and volume
  
  ⚙️ Commands:

  /price \\- Get price of a token
  /startmonitoring \\- Start monitoring swaps from token and token swap configured \\(admin only\\)
  /setconfig \\- Set token, swap token e video for alerts \\(admin only\\)
  /statusnode \\- Check node RPC and API GSCSCAN Connection\\.
  /devdetails \\- Check url for endpoints used in gic bot\\.`;
  
  
    const keyboard = Markup.inlineKeyboard([
      Markup.button.url('Official Website', 'https://gswapdex.finance'),
    ]);
  
    await ctx.replyWithMarkdownV2(welcomeMessage, {
      ...keyboard,
      parse_mode: 'MarkdownV2'
    });
}
  

async function consultCommand(ctx) {
  try{
    // Capture the arguments passed in the command
    const args = ctx.message.text.split(' ').slice(1);  // Remove the '/consult' command
  
    if (args.length === 0) {
      // If no arguments are provided, inform the user how to use the command
      return oneGetTokenMessage(ctx,[await getTokenConfig(ctx)]);
    } 
    if (args.length === 2) {
      return twogetTokenMessage(ctx,args);
    } 
    if(args.length === 1 && args[0].toLowerCase().includes('help')){  
      // If the number of arguments is not 2, show an error message
      const consultMessage = `🔍 **/consult \\- Check token stats**
      
  This command allows you to check the data of one or more specific tokens on the GSwap DEX\\. To check the tokens, send the command in the following format:
  
  \`/consult ${'tokenId1 tokenId2'}\`
  or
  \`/consult ${'tokenId1'}\` \\- Value in dollars, must be paired with GIC
  
  For example: \`/consult 0x0\\.\\.\\. 0x0\\.\\.\\.\`
  
  Please send **tokenId1** and **tokenId2** that you want to check\\.`;
      
      return await ctx.replyWithMarkdownV2(consultMessage);
    }
    if(args.length === 1){
      oneGetTokenMessage(ctx,args);
    }
    const errorMessage = `⚠️ To use the command correctly, send two tokenIds in the format:
  
    \`/consult ${'tokenId1 tokenId2'}\`
    
    Example: \`/consult 0x0\\.\\.\\. 0x0\\.\\.\\.\``;
    
    return await ctx.replyWithMarkdownV2(errorMessage);
  }catch(e){
    await ctx.replyWithMarkdownV2(`Oops... We\\’re having trouble fetching the coin price\\. Please try again later\\—we\\’re on it at transaction speed\\! ⚡
Getting Technical details\\.\\.\\.
`);
    await statusnode(ctx)
  }
}
  
module.exports = { startCommand, Analytics, TradeAlert,consultCommand,statusnode,devdetails };
