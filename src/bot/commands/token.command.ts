import { Context } from 'telegraf';
import { getRepository } from 'typeorm';
import { GroupConfig } from '../../entities';

export async function handleTokenInput(ctx: Context) {
  // Verificar tipo de mensagem e contexto
  if (!ctx.message || !('text' in ctx.message)) {
    return ctx.reply('❌ Please send a valid token address');
  }

  // Verificar se o chat existe
  if (!ctx.chat) {
    return ctx.reply('❌ Invalid chat context');
  }

  const tokenAddress = ctx.message.text.trim();
  
  // Validação rigorosa do endereço
  if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
    return ctx.replyWithMarkdownV2(
      '❌ *Invalid token address format*\n' +
      'Must be a valid 42-character hexadecimal address starting with 0x\n' +
      'Example: `0x19A4293c6E94406F5756FCB2012c677F39e61D59`'
    );
  }

  try {
    const groupRepo = getRepository(GroupConfig);
    const result = await groupRepo.update(
      { chatId: String(ctx.chat.id) },
      { tokenAddress: tokenAddress.toLowerCase() } // Normalizar endereço
    );

    if (result.affected === 0) {
      return ctx.reply('❌ Group not configured. Use /setup_group first');
    }

    await ctx.replyWithMarkdownV2(
      `✅ *Tracking token updated to:*\n\`${tokenAddress}\``,
      { parse_mode: 'MarkdownV2' }
    );
    
  } catch (error) {
    // Tratamento type-safe de erros
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await ctx.replyWithMarkdownV2(
      `❌ *Error updating token:* \`${errorMessage}\``
    );
  }
}