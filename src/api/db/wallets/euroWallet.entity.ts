import { Entity } from "typeorm";

import { BaseWallet } from "@/db/wallets/baseWallet.entity";

@Entity()
export class EuroWalletEntity extends BaseWallet {
  protected getWalletPrefix(): string {
    return "EUR";
  }
}
