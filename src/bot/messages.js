const { Markup } = require('telegraf');
const {isEthereumToken, getTokenConfig} = require('../config/tools');
const path = require('path');
const fs = require('fs');
const {oneGetTokenMessage,twogetTokenMessage} = require('./functions.messages');

const Analytics = (tokenAddress, currentPrice, hv24, symbol, lastTX) => {
  const response = `📊 **Token Analytics** 📊

🪙 Token: \`${tokenAddress}\` (${symbol})
💰 Current Price: $${currentPrice}
📈 24h Volume: ${hv24} ${symbol}
`;
  return response;
};

const TradeAlert = (token, price, priceToken,  symbol, symbolPrice, txhash) => {
  const response = `
🚨 **New Trade Alert** 🚨
────────────────────
🪙 Main Token: ${token}
🪙 Price Token: ${priceToken}
📈 Price: ${price} ${symbolPrice}
────────────────────
#GIC #${symbol} #TradingAlert
`;
  return response;
};

async function startCommand(ctx) {
    const welcomeMessage = `🚀 **GIC Blockchain Trading Bot** 🚀
  
  📊 Real\\-time trading signals for GSwap DEX
  🔔 Get instant swap notifications
  📈 Track token prices and volume
  
  ⚙️ Commands:

  /price \\- Get price of a token
  /startmonitoring \\- Start monitoring swaps from token configured \\(admin only\\)
  /setconfig \\- Set token address for alerts \\(admin only\\)`;
  
    const keyboard = Markup.inlineKeyboard([
      Markup.button.url('Official Website', 'https://gswapdex.finance'),
    ]);
  
    await ctx.replyWithMarkdownV2(welcomeMessage, {
      ...keyboard,
      parse_mode: 'MarkdownV2'
    });
}
  

async function consultCommand(ctx) {
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
      oneGetToken(ctx,args);
    }
    const errorMessage = `⚠️ To use the command correctly, send two tokenIds in the format:
  
    \`/consult ${'tokenId1 tokenId2'}\`
    
    Example: \`/consult 0x0\\.\\.\\. 0x0\\.\\.\\.\``;
    
    return await ctx.replyWithMarkdownV2(errorMessage);
}
  
module.exports = { startCommand, Analytics, TradeAlert,consultCommand };
