"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultCommand = consultCommand;
const typeorm_1 = require("typeorm");
const entities_1 = require("../../entities");
const ethers_1 = require("ethers");
const bot_1 = require("../bot"); // Corrigir export no arquivo bot.ts
async function consultCommand(ctx) {
    // Verificar se a mensagem existe
    if (!ctx.message || !('text' in ctx.message)) {
        return ctx.reply('❌ Invalid command context');
    }
    const [_, tokenAddress] = ctx.message.text.split(' ');
    if (!tokenAddress) {
        return ctx.reply('ℹ️ Usage: /consult <token_address>');
    }
    try {
        const swapRepo = (0, typeorm_1.getRepository)(entities_1.SwapEvent);
        const [latestSwaps, dailyVolume] = await Promise.all([
            swapRepo.find({
                where: { tokenAddress },
                order: { timestamp: 'DESC' },
                take: 5
            }),
            swapRepo.createQueryBuilder()
                .select('SUM(amount_in)', 'volume')
                .where('token_address = :token AND timestamp >= NOW() - INTERVAL \'24 HOURS\'', { token: tokenAddress })
                .getRawOne()
        ]);
        const currentPrice = await bot_1.redis.get(`token_price:${tokenAddress}`) || 'N/A';
        const response = `📊 **Token Analytics** 📊
    
🪙 Token: \`${tokenAddress}\`
💰 Current Price: ${currentPrice} GIC
📈 24h Volume: ${(0, ethers_1.formatUnits)(dailyVolume.volume || '0', 18)} GIC
🔄 Last 5 Trades:
${latestSwaps.map((swap, i) => `${i + 1}. ${(0, ethers_1.formatUnits)(swap.amountIn, 18)} GIC @ ${swap.timestamp.toLocaleTimeString()}`).join('\n')}`;
        await ctx.replyWithMarkdownV2(response.replace(/\./g, '\\.'));
    }
    catch (error) {
        // Tratar tipo unknown corretamente
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.reply(`❌ Error fetching data: ${errorMessage}`);
    }
}
