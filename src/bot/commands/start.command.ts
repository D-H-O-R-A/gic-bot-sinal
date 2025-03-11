import { Context } from 'telegraf';
import { Markup } from 'telegraf';
import { GIC_CONFIG } from '../../config';

export async function startCommand(ctx: Context) {
  const welcomeMessage = `🚀 **GIC Blockchain Trading Bot** 🚀

📊 Real-time trading signals for GIC DEX
🔔 Get instant swap notifications
📈 Track token prices and volume

⚙️ Commands:
/consult - Check token stats
/setup_group - Configure group alerts`;

  const keyboard = Markup.inlineKeyboard([
    Markup.button.url('Official Website', 'https://gic.network'),
    Markup.button.callback('📊 Live Charts', 'view_charts')
  ]);

  await ctx.replyWithMarkdownV2(welcomeMessage, {
    ...keyboard,
    parse_mode: 'MarkdownV2'
  });
}