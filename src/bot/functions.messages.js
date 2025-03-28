const {getTokenConfigDetails} = require('../config/tools');
const {getPairDetails} = require("../config/subgraph")
const {GIC_CONFIG} = require('../config/env');
const {logger} = require('../config/logger');


async function oneGetTokenMessage(ctx) {
    const config = await getTokenConfigDetails(ctx)
    const pairDetails = await getPairDetails(config.pairaddress);
    if(pairDetails == null){
        return ctx.reply(`You need add liquidity in pair ${config.tokenAddress}/${config.swapToken} to continue.`);
    }
    const price = (pairDetails.data.pair.token0.id).toLowerCase() == (config.tokenAddress).toLowerCase() ? pairDetails.data.pair.token0.derivedUSD : pairDetails.data.pair.token1.derivedUSD;
        
    // Mensagem formatada
    let msg = `🪙 **Token \\(${config.tokenName}\\):**\n\n`;
    msg += `📛 Name: \`${config.tokenName}\`\n`;
    msg += `🔡 Symbol: \`${config.tokenSymbol}\`\n`;
    msg += `💰 Total Supply: \`${new Intl.NumberFormat('en-US').format(parseFloat(config.tokenTotalSupply).toFixed(0))}\`\n`;
    msg += `💲 Marketcap: \`${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(parseFloat(price * config.tokenTotalSupply).toFixed(0))}\`\n`;
    msg += `💲 Price: \`${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 6 }).format(price)}\`\n`;

    // url da image
    const image = config.imagem;
    logger.info("image:"+image)
    const imageUrl = image ? image : GIC_CONFIG.DEFAULT_GIF_URL;
    // Enviar a imagem com a legenda
    try {
        return await ctx.replyWithPhoto(imageUrl, { caption: msg, parse_mode: "MarkdownV2" });
    }
    catch (error) {
        logger.info("Erro ao enviar a mensagem:"+JSON.stringify(error));
        return ctx.replyWithMarkdownV2("SetConfig was not configured correctly\\. Try again running /setconfig \\(main token id\\) \\(swap token id\\) \\(gif url\\)");
    }
}

module.exports={oneGetTokenMessage};