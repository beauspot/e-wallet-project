import { v4 as uuidv4 } from "uuid";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  OneToOne,
} from "typeorm";

import { gender_enum, userRole } from "@/enum/user.enum";
import { AccountBalance } from "@/db/userWallet.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  date_of_birth: Date;

  @Column()
  password: string;

  @Column({ unique: true, length: 11 })
  nin: string;

  @Column({ unique: true, length: 11 })
  bvn: string;

  @Column({
    type: "enum",
    enum: gender_enum,
  })
  gender: gender_enum;

  @OneToOne(() => AccountBalance, (accountBal) => accountBal.user)
  accountBalance: AccountBalance;

  @Column({
    type: "enum",
    enum: userRole,
  })
  role: userRole;

  @BeforeInsert()
  generateId() {
    this.id = `userID-${uuidv4()}`;
  }
}
