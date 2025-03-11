"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const typeorm_1 = require("typeorm");
const entities_1 = require("../entities");
const bot_1 = require("../bot/bot");
const config_1 = require("../config");
const ethers_1 = require("ethers");
class TokenService {
    static async getTrackedToken(tokenA, tokenB) {
        const groups = await (0, typeorm_1.getRepository)(entities_1.GroupConfig)
            .createQueryBuilder()
            .where(':token = ANY(tokens)', { token: tokenA })
            .orWhere(':token = ANY(tokens)', { token: tokenB })
            .getMany();
        return groups.length > 0 ? groups[0].tokenAddress : null;
    }
    static async processPriceUpdate(tokenAddress) {
        const provider = new ethers_1.ethers.JsonRpcProvider(config_1.GIC_CONFIG.RPC_URL);
        // Implementar lógica de cálculo de preço real
        const price = await this.calculatePrice(tokenAddress, provider);
        await bot_1.redis.set(`token_price:${tokenAddress}`, price.toString());
        await this.sendNotifications(tokenAddress, price);
    }
    static async calculatePrice(tokenAddress, provider) {
        // Implementar oráculo de preço
        return 0;
    }
    static async sendNotifications(tokenAddress, price) {
        const groups = await (0, typeorm_1.getRepository)(entities_1.GroupConfig)
            .find({ where: { tokenAddress } });
        for (const group of groups) {
            // Enviar mensagem para o grupo
            const message = this.generateSignalMessage(tokenAddress, price);
            // Implementar envio real
        }
    }
    static generateSignalMessage(token, price) {
        return `🚨 New Trade Alert 🚨
    \nToken: ${token.slice(0, 6)}...${token.slice(-4)}
    \nPrice: ${price} GIC`;
    }
}
exports.TokenService = TokenService;
