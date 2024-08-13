import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  OneToOne,
} from "typeorm";
import { nanoid } from "nanoid";

import { gender_enum, userRole } from "@/enum/user.enum";
import { AccountBalance } from "@/db/userBalance.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  date_of_birth: Date;

  @Column()
  password: string;

  @Column()
  bvn: number;

  @Column()
  gender: gender_enum;

  @OneToOne(() => AccountBalance, (accountBal) => accountBal.user)
  accountBalance: AccountBalance;

  @Column()
  role: userRole;

  @BeforeInsert()
  generateId() {
    this.id = `userid-${nanoid()}`;
  }
}
