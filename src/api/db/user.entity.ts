import { v4 as uuidv4 } from "uuid";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";

import { UserWallet } from "@/db/wallet.entity"
import { gender_enum, userRole } from "@/enum/user.enum";
import { SettlementAcct } from "@/db/settlementAccts.entity";
import { UserTransactionModel } from "@/db/transactions.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  middleName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false })
  phoneNumber: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  dob: Date;

  // ToDO: the password must be hashed.
  @Column({ nullable: false })
  password: string;

  @Column({ unique: true, length: 11, nullable: false })
  nin: string;

  @Column({ unique: true, length: 11, nullable: false })
  bvn: string;

  @Column({
    type: "enum",
    enum: gender_enum,
    nullable: false,
  })
  gender: gender_enum;

  @Column({
    type: "enum",
    enum: userRole,
    default: userRole.Customer,
    nullable: false,
  })
  role: userRole;

  @Column({ unique: true })
  account_no: string;

  @OneToOne(() => SettlementAcct, (settlementAcct) => settlementAcct.userAcct, {
    cascade: true
  })
  @JoinColumn()
  settlementAcct: SettlementAcct;

  @OneToOne(() => UserWallet, (wallet) => wallet.user, {
    cascade: true,
  })
  @JoinColumn()
  wallet: UserWallet;

  @OneToMany(() => UserTransactionModel, (transaction) => transaction.user, {
    cascade: true
  })
  @JoinColumn()
  transactions: UserTransactionModel[];

  @BeforeInsert()
  @OneToMany(() => UserTransactionModel, (transactions) => transactions.user, {
    cascade: true
  })
  @JoinColumn()

  @BeforeInsert()
  generateAccountID() {
    this.account_no = this.phoneNumber
  }
  
  @BeforeInsert()
  generateId() {
    this.id = `userID-${uuidv4()}`;
  };

  @CreateDateColumn()
  createdAt: Date;
}
