import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcryptjs";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import crypto from "crypto";
import { UserWallet } from "@/db/wallet.entity";
import { gender_enum, userRole } from "@/enum/user.enum";
import { SettlementAcct } from "@/db/settlementAccts.entity";
import { UserTransactionModel } from "@/db/transactions.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false, unique: true })
  phoneNumber: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  dob: Date;

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

  @Column({ nullable: true })
  businessName: string;

  @Column({ nullable: true })
  accountName: string;

  @Column({ nullable: true })
  GovernmentIDImage: string;

  @Column({ nullable: true, default: "default.jpg" })
  photo: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  lga: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true, select: false })
  active: boolean;

  @Column({ nullable: true })
  passwordChangedAt: Date;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true, type: "timestamp" })
  passwordResetExpires: Date;

  @Column({ default: 0 })
  passwordResetAttempts: number;

  @Column({ nullable: true, default: false })
  acceptTerms: boolean;

  @OneToOne(() => SettlementAcct, (settlementAcct) => settlementAcct.userAcct, {
    cascade: true,
  })
  @JoinColumn()
  settlementAcct: SettlementAcct;

  @OneToOne(() => UserWallet, (wallet) => wallet.user, {
    cascade: true,
  })
  @JoinColumn()
  wallet: UserWallet;

  @OneToMany(() => UserTransactionModel, (transaction) => transaction.user, {
    cascade: true,
  })
  transactions: UserTransactionModel[];

  @BeforeInsert()
  generateAccountID() {
    this.account_no = this.phoneNumber;
  }

  @BeforeInsert()
  generateId() {
    this.id = `userID-${uuidv4()}`;
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  createPasswordResetToken(): string {
    const otp = crypto.randomBytes(3).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(otp).digest("hex");
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    this.passwordResetAttempts = 0;
    return otp;
  }

  changedPasswordAfter(JWTTimestamp: number): boolean {
    if (this.passwordChangedAt) {
      const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  }
}
