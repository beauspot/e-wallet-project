import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";

import { User } from "@/db/user.entity";

@Entity()
export class AccountBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "decimal", precision: 18, scale: 8, default: 0 })
  balance: string; // Store balance as a string to handle precision

  @OneToOne(() => User, (user) => user.accountBalance)
  @JoinColumn()
  user: User; // Reference to the User entity
}
