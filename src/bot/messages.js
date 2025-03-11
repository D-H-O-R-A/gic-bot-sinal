const { Markup } = require('telegraf');
const { GIC_CONFIG } = require('../config/env');
const { EXPLORER } = GIC_CONFIG;
const {isEthereumToken} = require('../config/tools');
const {getTokenInfo,checkPairExists,getTokenPrice,getUSDTTOkenPrice} = require('../blockchain/contract');
const path = require('path');
const fs = require('fs');

const Analytics = (tokenAddress, currentPrice, hv24, symbol, lastTX) => {
  const response = `📊 **Token Analytics** 📊

🪙 Token: \`${tokenAddress}\` (${symbol})
💰 Current Price: $${currentPrice}
📈 24h Volume: ${hv24} ${symbol}
💱 Last Swap Tx: ${EXPLORER}/tx/${lastTX}
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
🌐 Tx Hash: ${EXPLORER}/tx/${txhash}
────────────────────
#GIC #${symbol} #TradingAlert
`;
  return response;
};

async function startCommand(ctx) {
    const welcomeMessage = `🚀 **GIC Blockchain Trading Bot** 🚀
  
  📊 Real\\-time trading signals for GIC DEX
  🔔 Get instant swap notifications
  📈 Track token prices and volume
  
  ⚙️ Commands:

  /consult \\- Check token stats
  /startmonitoring \\- Start monitoring swaps from token configured
  /setconfig \\- Set token address for alerts`;
  
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
      const consultMessage = `🔍 **/consult \\- Check token stats**
      
  This command allows you to check the data of one or more specific tokens on the GIC DEX\\. To check the tokens, send the command in the following format:
  
  \`/consult ${'tokenId1 tokenId2'}\`
  or
  \`/consult ${'tokenId1'}\` - Value in dollars, must be paired with GIC
  
  For example: \`/consult 0x0\\.\\.\\. 0x0\\.\\.\\.\`
  
  Please send **tokenId1** and **tokenId2** that you want to check\\.`;
      
      await ctx.replyWithMarkdownV2(consultMessage);
    } else if (args.length === 2) {
      var msg = `🔍 **/consult \\- Check token stats**\n\n`;
      // If the user passes two tokenIds, return the token stats
      const tokenId1 = args[0];
      const tokenId2 = args[1];
      if(isEthereumToken(tokenId1) && isEthereumToken(tokenId2)){
        const token1 = await getTokenInfo(tokenId1);
        const token2 = await getTokenInfo(tokenId2);
        const pairAddress = await checkPairExists(tokenId1,tokenId2);
        var pairdetails = {};
        if(pairAddress!=null){
            pairdetails.price = await getTokenPrice(pairAddress, tokenId1);
        }
        if(!(token1==null||token2==null) && args.length === 2){
            msg += `Details About the Tokens and Pair \\(\`${token1.name}\`\\/\`${token2.name}\`\\)\n\n`;
            msg += `🪙 **Token 1 \\(${token1.name}\\):**\n\n`;
            msg += `📛 Name: \`${token1.name}\`\n`;
            msg += `🔡 Symbol: \`${token1.symbol}\`\n`;
            msg += `💰 Total Supply: \`${token1.totalSupply}\`\n`;
            msg += `💲 Price: \`${pairAddress!=null ? pairdetails.price["price["+token1.id+"]"] : "Not Avaliabe"} $${pairAddress!=null ? token2.symbol : ""}\`\n\n `;
            msg += `View on GSCScan: [Token 1](${EXPLORER}/token/${tokenId1})\n\n`;
            msg += `🪙 **Token 2 \\(${token2.name}\\):**\n\n`;
            msg += `📛 Name: \`${token2.name}\`\n`;
            msg += `🔡 Symbol: \`${token2.symbol}\`\n`;
            msg += `💰 Total Supply: \`${token2.totalSupply}\`\n`;
            msg += `💲 Price: \`${pairAddress!=null ? pairdetails.price["price["+token2.id+"]"] : "Not Avaliable"} $${pairAddress!=null ? token1.symbol: ""}\`\n\n `;
            msg += `View on GSCScan: [Token 2](${EXPLORER}/token/${tokenId2})\n\n`;
            msg += `🔗 **Pair Info:**\n\n`;
            msg += `🔄 Pair Exist: \`${pairAddress!=null}\`\n`; 
            if(pairAddress!=null){
                msg += `🔗 Pair Address: \`${pairAddress}\`\n`;
                msg += `View on GSCScan: [Pair](${EXPLORER}/address/${pairAddress})\n\n`;
                msg += `📊 **Pair Analytics:**\n\n`;
                msg += `💲 Price ${token1.symbol}: \`${pairAddress!=null ? pairdetails.price["price["+token1.id+"]"] : "Not Avaliable"} $${token2.symbol}\`\n`
                msg += `💲 Price ${token2.symbol}: \`${pairAddress!=null ? pairdetails.price["price["+token2.id+"]"] : "Not Avaliable"} $${token1.symbol}\`\n`
                //msg += `💰 24h Volume \\($${token1.symbol}\\): \`232.231.222\`\n `;
                //msg += `💰 24h Volume \\($${token2.symbol}\\): \`32.123.221\`\n `;
                msg += `🏦 Reserve \\($${token1.symbol}\\): \`${pairdetails.price["reserve["+token1.id+"]"]}\`\n `;
                msg += `🏦 Reserve \\($${token2.symbol}\\): \`${pairdetails.price["reserve["+token2.id+"]"]}\`\n `;
            }
        }else{
            msg += `⚠️ Invalid Token Address. Please check the token address and try again.`;
        }
      }else{
        msg += `⚠️ To use the command correctly, send two tokenIds in ERC\\-20 format\\.`
      }  
      msg = msg.replaceAll(".","\\.")
      await ctx.replyWithMarkdownV2(msg);
    } else if(args.length === 1){
        const tokenId = args[0];
        if(isEthereumToken(tokenId)){
            const token = await getTokenInfo(tokenId);
            if(token!=null){
                const price = await getUSDTTOkenPrice(tokenId);
                console.log(token)
                msg = `🪙 **Token \\(${token.name}\\):**\n\n`;
                msg += `📛 Name: \`${token.name}\`\n`;
                msg += `🔡 Symbol: \`${token.symbol}\`\n`;
                msg += `💰 Total Supply: \`${token.totalSupply}\`\n`;
                msg += `💲 Marketcap: $\`${price*token.totalSupply} \`\n`;
                msg += `💲 Price: $\`${price} \`\n`;
                msg += `View on GSCScan: [Token](${EXPLORER}/token/${tokenId})\n\n`;
                await ctx.replyWithMarkdownV2(msg);
            }else{
                await ctx.replyWithMarkdownV2(`⚠️ Invalid Token Address. Please check the token address and try again.`);
            }
        }else{
            await ctx.replyWithMarkdownV2(`⚠️ To use the command correctly, send two tokenIds in ERC\\-20 format\\.`);
        }
    }else {
      // If the number of arguments is not 2, show an error message
      const errorMessage = `⚠️ To use the command correctly, send two tokenIds in the format:
  
  \`/consult ${'tokenId1 tokenId2'}\`
  
  Example: \`/consult 0x0\\.\\.\\. 0x0\\.\\.\\.\``;
  
      await ctx.replyWithMarkdownV2(errorMessage);
    }
}
  
module.exports = { startCommand, Analytics, TradeAlert,consultCommand };
