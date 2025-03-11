"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainListener = void 0;
const ethers_1 = require("ethers");
const config_1 = require("../config");
const entities_1 = require("../entities");
const typeorm_1 = require("typeorm");
const logger_1 = require("../utils/logger");
const token_service_1 = require("../services/token.service");
const ROUTER_ABI = [
    'event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)'
];
class BlockchainListener {
    provider;
    contract;
    constructor() {
        this.provider = new ethers_1.ethers.WebSocketProvider(config_1.GIC_CONFIG.WSS_URL);
        this.contract = new ethers_1.ethers.Contract(config_1.GIC_CONFIG.ROUTER_ADDRESS, ROUTER_ABI, this.provider);
    }
    async start() {
        this.contract.on('Swap', async (sender, amount0In, amount1In, amount0Out, amount1Out, to, event) => {
            try {
                const tx = await event.getTransactionReceipt();
                const { tokenIn, tokenOut, amountIn, amountOut } = this.parseSwap(tx);
                const token = await token_service_1.TokenService.getTrackedToken(tokenIn, tokenOut);
                if (!token)
                    return;
                const swapRepo = (0, typeorm_1.getRepository)(entities_1.SwapEvent);
                await swapRepo.save({
                    txHash: tx.hash,
                    blockNumber: tx.blockNumber,
                    tokenAddress: token,
                    amountIn: amountIn.toString(),
                    amountOut: amountOut.toString(),
                    timestamp: new Date()
                });
                await token_service_1.TokenService.processPriceUpdate(token);
            }
            catch (error) {
                logger_1.logger.error('Error processing swap:', error);
            }
        });
        this.provider.on('error', (err) => {
            logger_1.logger.error('WebSocket error:', err);
            setTimeout(() => this.start(), 5000);
        });
    }
    parseSwap(tx) {
        // Implementação específica da análise de logs
        return {
            tokenIn: '0x...',
            tokenOut: '0x...',
            amountIn: BigInt('...'),
            amountOut: BigInt('...')
        };
    }
}
exports.BlockchainListener = BlockchainListener;
