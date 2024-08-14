import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  BeforeInsert,
} from "typeorm";

import { User } from "@/db/user.entity";
import { v4 as uuidv4 } from "uuid";

@Entity()
export class AccountBalance {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "decimal", precision: 18, scale: 8, default: 0 })
  balance: string; // Store balance as a string to handle precision

  @OneToOne(() => User, (user) => user.accountBalance)
  @JoinColumn()
  user: User; // Reference to the User entity

  @BeforeInsert()
  generateId() {
    this.id = `BAL-${uuidv4()}`;
  }
}
