import 'reflect-metadata'; // Import this at the very top
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcryptjs";
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
import { User } from "@/db/user.entity";

@Entity()
export class UserWallet extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'float', default: 0.0 }) // Explicitly define the type
  balance: number;

  @Column({ type: "varchar", length: 4, nullable: false })
  transaction_pin: string;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn()
  user: User;

  @BeforeInsert()
  @BeforeUpdate()
  async hashTransactionPin() {
    if (this.transaction_pin) {
      const saltRounds = 12;
      this.transaction_pin = await bcrypt.hash(this.transaction_pin, saltRounds);
    }
  }

  async compareTransactionPin(pin: string): Promise<boolean> {
    return bcrypt.compare(pin, this.transaction_pin);
  }

  @Column({ nullable: true })
  transactionPinResetToken: string;

  @Column({ nullable: true, type: "timestamp" })
  transactionPinTokenExpires: Date;

  @Column({ default: 0 })
  transactionResetAttempts: number;

  @BeforeInsert()
  generateId() {
    this.id = `walletID-${uuidv4()}`;
  }

  @CreateDateColumn()
  createdAt: Date;
}
