"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCommand = startCommand;
const telegraf_1 = require("telegraf");
async function startCommand(ctx) {
    const welcomeMessage = `🚀 **GIC Blockchain Trading Bot** 🚀

📊 Real-time trading signals for GIC DEX
🔔 Get instant swap notifications
📈 Track token prices and volume

⚙️ Commands:
/consult - Check token stats
/setup_group - Configure group alerts`;
    const keyboard = telegraf_1.Markup.inlineKeyboard([
        telegraf_1.Markup.button.url('Official Website', 'https://gic.network'),
        telegraf_1.Markup.button.callback('📊 Live Charts', 'view_charts')
    ]);
    await ctx.replyWithMarkdownV2(welcomeMessage, {
        ...keyboard,
        parse_mode: 'MarkdownV2'
    });
}
