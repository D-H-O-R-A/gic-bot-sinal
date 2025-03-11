import { Context } from 'telegraf';
import { getRepository } from 'typeorm';
import { SwapEvent } from '../../entities';
import { formatUnits } from 'ethers';
import { redis } from '../bot'; // Corrigir export no arquivo bot.ts

export async function consultCommand(ctx: Context) {
  // Verificar se a mensagem existe
  if (!ctx.message || !('text' in ctx.message)) {
    return ctx.reply('❌ Invalid command context');
  }

  const [_, tokenAddress] = ctx.message.text.split(' ');
  
  if (!tokenAddress) {
    return ctx.reply('ℹ️ Usage: /consult <token_address>');
  }

  try {
    const swapRepo = getRepository(SwapEvent);
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

    const currentPrice = await redis.get(`token_price:${tokenAddress}`) || 'N/A';

    const response = `📊 **Token Analytics** 📊
    
🪙 Token: \`${tokenAddress}\`
💰 Current Price: ${currentPrice} GIC
📈 24h Volume: ${formatUnits(dailyVolume.volume || '0', 18)} GIC
🔄 Last 5 Trades:
${latestSwaps.map((swap, i) => 
  `${i+1}. ${formatUnits(swap.amountIn, 18)} GIC @ ${swap.timestamp.toLocaleTimeString()}`
).join('\n')}`;

    await ctx.replyWithMarkdownV2(response.replace(/\./g, '\\.'));
  } catch (error) {
    // Tratar tipo unknown corretamente
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    ctx.reply(`❌ Error fetching data: ${errorMessage}`);
  }
}