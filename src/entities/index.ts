import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';

@Entity()
@Index(['txHash'], { unique: true })
export class SwapEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;  // Definite assignment assertion

  @Column()
  txHash!: string;

  @Column()
  blockNumber!: number;

  @Column()
  tokenAddress!: string;

  @Column({ type: 'numeric', precision: 36, scale: 18 })
  amountIn!: string;

  @Column({ type: 'numeric', precision: 36, scale: 18 })
  amountOut!: string;

  @CreateDateColumn()
  timestamp!: Date;
}

@Entity()
@Index(['chatId'], { unique: true })
export class GroupConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  chatId!: string;

  @Column()
  tokenAddress!: string;

  @Column({ default: false })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}