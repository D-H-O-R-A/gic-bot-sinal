"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupGroupCommand = setupGroupCommand;
const telegraf_1 = require("telegraf");
const typeorm_1 = require("typeorm");
const entities_1 = require("../../entities");
async function setupGroupCommand(ctx) {
    // Verificar se a mensagem e o chat existem
    if (!ctx.message || !('text' in ctx.message) || !ctx.chat) {
        return ctx.reply('❌ Invalid command context');
    }
    // Verificar tipo de chat
    if (!['group', 'supergroup', 'channel'].includes(ctx.chat.type)) {
        return ctx.reply('❌ This command only works in groups/channels');
    }
    try {
        // Verificar se o bot é admin
        const botMember = await ctx.getChatMember(ctx.botInfo.id);
        if (botMember.status !== 'administrator') {
            return ctx.reply('⚠️ Please make me admin first!');
        }
        // Extrair endereço do token
        const [_, tokenAddress] = ctx.message.text.split(' ');
        if (!tokenAddress?.startsWith('0x')) {
            return ctx.reply('ℹ️ Usage: /setup_group <token_address>\nExample: /setup_group 0x19A4293c6E94406F5756FCB2012c677F39e61D59');
        }
        // Salvar configuração
        const groupRepo = (0, typeorm_1.getRepository)(entities_1.GroupConfig);
        await groupRepo.save({
            chatId: String(ctx.chat.id),
            tokenAddress: tokenAddress.toLowerCase(), // Normalizar endereço
            isActive: true
        });
        // Resposta formatada
        await ctx.replyWithMarkdownV2(`✅ *Group configured successfully\\!*\n` +
            `Tracking token: \`${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}\``, telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback('🛑 Disable Alerts', 'disable_alerts')
        ]));
    }
    catch (error) {
        // Tratamento de erros type-safe
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await ctx.reply(`❌ Error configuring group: ${errorMessage}`);
    }
}
