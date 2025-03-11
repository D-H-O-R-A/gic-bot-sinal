import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { GIC_CONFIG } from './index';
import { SwapEvent, GroupConfig } from '../entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: GIC_CONFIG.DB_URL,
  synchronize: false, // Sempre false em produção!
  logging: process.env.NODE_ENV === 'development',
  entities: [SwapEvent, GroupConfig],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'typeorm_migrations',
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false,
});

// Para uso com TypeORM CLI (migrations)
module.exports = {
  ...AppDataSource.options,
  cli: {
    migrationsDir: 'src/migrations'
  }
};