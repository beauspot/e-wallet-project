import { Entity } from "typeorm";

import { BaseWallet } from "@/db/wallets/baseWallet.entity";

@Entity()
export class DollarWalletEntity extends BaseWallet {
  protected getWalletPrefix(): string {
    return "USD";
  }
}
