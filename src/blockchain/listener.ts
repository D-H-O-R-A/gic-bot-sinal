import { ethers } from 'ethers';
import { GIC_CONFIG } from '../config';
import { SwapEvent } from '../entities';
import { getRepository } from 'typeorm';
import { logger } from '../utils/logger';
import { TokenService } from '../services/token.service';

const ROUTER_ABI = [
  'event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)'
];

export class BlockchainListener {
  private provider: ethers.WebSocketProvider;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.WebSocketProvider(GIC_CONFIG.WSS_URL);
    this.contract = new ethers.Contract(GIC_CONFIG.ROUTER_ADDRESS, ROUTER_ABI, this.provider);
  }

  async start() {
    this.contract.on('Swap', async (sender, amount0In, amount1In, amount0Out, amount1Out, to, event) => {
      try {
        const tx = await event.getTransactionReceipt();
        const { tokenIn, tokenOut, amountIn, amountOut } = this.parseSwap(tx);
        
        const token = await TokenService.getTrackedToken(tokenIn, tokenOut);
        if (!token) return;

        const swapRepo = getRepository(SwapEvent);
        await swapRepo.save({
          txHash: tx.hash,
          blockNumber: tx.blockNumber,
          tokenAddress: token,
          amountIn: amountIn.toString(),
          amountOut: amountOut.toString(),
          timestamp: new Date()
        });

        await TokenService.processPriceUpdate(token);
      } catch (error) {
        logger.error('Error processing swap:', error);
      }
    });

    this.provider.on('error', (err) => {
      logger.error('WebSocket error:', err);
      setTimeout(() => this.start(), 5000);
    });
  }

  private parseSwap(tx: any) {
    // Implementação específica da análise de logs
    return {
      tokenIn: '0x...',
      tokenOut: '0x...',
      amountIn: BigInt('...'),
      amountOut: BigInt('...')
    };
  }
}