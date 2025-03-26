const {getTokenConfigDetails} = require('../config/tools');
const {getPairDetails} = require("../config/subgraph")
const {GIC_CONFIG} = require('../config/env');

async function oneGetTokenMessage(ctx) {
    const config = await getTokenConfigDetails(ctx)
    const pairDetails = await getPairDetails(config.pairaddress);
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
    console.log("image:", image)
    const imageUrl = image ? image : GIC_CONFIG.DEFAULT_IMAGE_URL;
    // Enviar a imagem com a legenda
    return await ctx.replyWithAnimation(imageUrl, { caption: msg, parse_mode: "MarkdownV2" });
}

module.exports={oneGetTokenMessage};