import { v4 as uuidv4 } from "uuid";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "@/db/user.entity";
import { TransactionEntity } from "@/api/db/transactions/transactions.entity";

// Base Wallet Entity
@Entity()
export abstract class BaseWallet {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "decimal", precision: 18, scale: 8, default: 0 })
  balance: string; // Store balance as a string to handle precision

  @ManyToOne(() => User, (user) => user.wallets)
  user: User; // Reference to the User entity

  @OneToMany(() => TransactionEntity, (transaction) => transaction.wallet)
  transactions: TransactionEntity[];

  @BeforeInsert()
  generateId() {
    this.id = `${this.getWalletPrefix()}-${uuidv4()}`;
  }

  // Abstract method for wallet prefix
  protected abstract getWalletPrefix(): string;
}
