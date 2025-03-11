import { getRepository } from 'typeorm';
import { SwapEvent, GroupConfig } from '../entities';
import { logger } from '../utils/logger';
import { redis } from '../bot/bot';
import { GIC_CONFIG } from '../config';
import { ethers } from 'ethers';

export class TokenService {
  static async getTrackedToken(tokenA: string, tokenB: string) {
    const groups = await getRepository(GroupConfig)
      .createQueryBuilder()
      .where(':token = ANY(tokens)', { token: tokenA })
      .orWhere(':token = ANY(tokens)', { token: tokenB })
      .getMany();

    return groups.length > 0 ? groups[0].tokenAddress : null;
  }

  static async processPriceUpdate(tokenAddress: string) {
    const provider = new ethers.JsonRpcProvider(GIC_CONFIG.RPC_URL);
    
    // Implementar lógica de cálculo de preço real
    const price = await this.calculatePrice(tokenAddress, provider);
    
    await redis.set(`token_price:${tokenAddress}`, price.toString());
    await this.sendNotifications(tokenAddress, price);
  }

  private static async calculatePrice(tokenAddress: string, provider: ethers.Provider) {
    // Implementar oráculo de preço
    return 0;
  }

  private static async sendNotifications(tokenAddress: string, price: number) {
    const groups = await getRepository(GroupConfig)
      .find({ where: { tokenAddress } });

    for (const group of groups) {
      // Enviar mensagem para o grupo
      const message = this.generateSignalMessage(tokenAddress, price);
      // Implementar envio real
    }
  }

  private static generateSignalMessage(token: string, price: number) {
    return `🚨 New Trade Alert 🚨
    \nToken: ${token.slice(0, 6)}...${token.slice(-4)}
    \nPrice: ${price} GIC`;
  }
}