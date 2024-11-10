import { v4 as uuidv4 } from "uuid";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  BaseEntity
} from "typeorm";

import { User } from "@/db/user.entity"

@Entity()
export class UserWallet extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ default: 0.0 })
  balance: number

  // TODO: the transaction pin must be hashed
  @Column()
  transaction_pin: string;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn()
  user: User;

  @BeforeInsert()
  generateId() {
    this.id = `walletID-${uuidv4()}`;
  }

  @CreateDateColumn()
  createdAt: Date
};