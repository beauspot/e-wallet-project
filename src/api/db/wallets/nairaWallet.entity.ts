import { Entity } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { BaseWallet } from "@/db/wallets/baseWallet.entity";

@Entity()
export class NairaWalletEntity extends BaseWallet {
  protected getWalletPrefix(): string {
    return "NAIRA";
  }
}
