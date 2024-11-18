import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcryptjs"
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  BaseEntity,
  BeforeUpdate
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
  @BeforeUpdate()
  async hashTransactionPin() {
    if (this.transaction_pin) {
      let saltRounds = 12;
      this.transaction_pin = await bcrypt.hash(this.transaction_pin, saltRounds)
    }
  }

  @BeforeInsert()
  generateId() {
    this.id = `walletID-${uuidv4()}`;
  }

  @CreateDateColumn()
  createdAt: Date
};