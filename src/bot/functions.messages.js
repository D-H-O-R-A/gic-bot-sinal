const {getTokenInfo,checkPairExists,getTokenPrice,getUSDTTOkenPrice} = require('../blockchain/contract');
const {isEthereumToken,getTokenConfigDetails} = require('../config/tools');
const {GIC_CONFIG} = require('../config/env');

async function oneGetTokenMessage(ctx, args) {
    const tokenId = args[0];
    const config = await getTokenConfigDetails(ctx)
    if (isEthereumToken(tokenId)) {
        const token = await getTokenInfo(tokenId);
        if (token != null) {
            const price = await getUSDTTOkenPrice(tokenId);
            
            // Mensagem formatada
            let msg = `🪙 **Token \\(${token.name}\\):**\n\n`;
            msg += `📛 Name: \`${token.name}\`\n`;
            msg += `🔡 Symbol: \`${token.symbol}\`\n`;
            msg += `💰 Total Supply: \`${new Intl.NumberFormat('de-DE').format(parseFloat(token.totalSupply).toFixed(0))}\`\n`;
            msg += `💲 Marketcap: \`${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(parseFloat(price * token.totalSupply).toFixed(0))}\`\n`;
            msg += `💲 Price: \`${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 6 }).format(price)}\`\n`;

            // url da image
            const image = config.imagem;
            console.log("image:", image)
            const imageUrl = image ? image : GIC_CONFIG.DEFAULT_IMAGE_URL;
            // Enviar a imagem com a legenda
            return await ctx.replyWithAnimation(imageUrl, { caption: msg, parse_mode: "MarkdownV2" });
        } else {
            return await ctx.replyWithMarkdownV2(`⚠️ Invalid Token Address. Please check the token address and try again.`);
        }
    } else {
        return await ctx.replyWithMarkdownV2(`⚠️ To use the command correctly, send a tokenId in ERC-20 format.`);
    }
}


async function twogetTokenMessage(ctx,args){
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
          msg += `🪙 **Token 2 \\(${token2.name}\\):**\n\n`;
          msg += `📛 Name: \`${token2.name}\`\n`;
          msg += `🔡 Symbol: \`${token2.symbol}\`\n`;
          msg += `💰 Total Supply: \`${token2.totalSupply}\`\n`;
          msg += `💲 Price: \`${pairAddress!=null ? pairdetails.price["price["+token2.id+"]"] : "Not Avaliable"} $${pairAddress!=null ? token1.symbol: ""}\`\n\n `;
          msg += `🔗 **Pair Info:**\n\n`;
          msg += `🔄 Pair Exist: \`${pairAddress!=null}\`\n`; 
          if(pairAddress!=null){
              msg += `🔗 Pair Address: \`${pairAddress}\`\n`;
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
    return await ctx.replyWithMarkdownV2(msg);
}

module.exports={oneGetTokenMessage,twogetTokenMessage};