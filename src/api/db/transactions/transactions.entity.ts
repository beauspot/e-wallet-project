import { v4 as uuidv4 } from "uuid";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  ManyToOne,
} from "typeorm";

import { NairaWalletEntity } from "@/db/wallets/nairaWallet.entity";

@Entity()
export class TransactionEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column()
  Amount: number;

  @Column()
  crypto: boolean;

  @Column()
  fiat_currency: boolean;

  @Column()
  Description: string;

  @ManyToOne(() => NairaWalletEntity, (wallet) => wallet.transactions)
  wallet: NairaWalletEntity;

  @BeforeInsert()
  generateId() {
    this.id = `TransactionID-${uuidv4()}`;
  }
}
