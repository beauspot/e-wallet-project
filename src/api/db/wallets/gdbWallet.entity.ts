import { Entity } from "typeorm";

import { BaseWallet } from "@/db/wallets/baseWallet.entity";

@Entity()
export class GDBWalletEntity extends BaseWallet {
  protected getWalletPrefix(): string {
    return "GDB";
  }
}
