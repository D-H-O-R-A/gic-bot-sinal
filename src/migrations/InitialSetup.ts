import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSetup1700000000000 implements MigrationInterface {
  name = 'InitialSetup1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS timescaledb;
      
      CREATE TABLE swap_event (
        id UUID PRIMARY KEY,
        tx_hash VARCHAR(66) NOT NULL UNIQUE,
        block_number INTEGER NOT NULL,
        token_address VARCHAR(42) NOT NULL,
        amount_in NUMERIC(36,18) NOT NULL,
        amount_out NUMERIC(36,18) NOT NULL,
        timestamp TIMESTAMPTZ NOT NULL
      );

      SELECT create_hypertable('swap_event', 'timestamp');
      
      CREATE TABLE group_config (
        id SERIAL PRIMARY KEY,
        chat_id VARCHAR(255) NOT NULL UNIQUE,
        token_address VARCHAR(42) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE swap_event CASCADE`);
    await queryRunner.query(`DROP TABLE group_config CASCADE`);
  }
}