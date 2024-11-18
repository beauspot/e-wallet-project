import { Service } from "typedi";
import bcrypt from "bcryptjs";
import { Flw } from "@/utils/flutterwave";
import { UserTransactionModel } from "@/db/transactions.entity";
import { UserWallet } from "@/db/wallet.entity";
import AppError from "@/utils/appErrors";
import { AppDataSource } from "@/configs/db.config";

@Service()
export class WalletService {
    constructor(private wallet: typeof UserWallet) { }

    async getWallet(userId: string) {
        try {
            const walletRepository = AppDataSource.getRepository(this.wallet);
            const wallet = await walletRepository.findOne({
                where: { user: { id: userId } },
                relations: ["user"]
            });
            if (!wallet) throw new AppError(`Wallet not found, please contact administrator`, "failed", false);

            return wallet;
        } catch (error: any) {
            throw new AppError(`${error.message}`, "failed", false);
        }
    };

    async getBalance(userId: string) {
        try {
            const walletRepository = AppDataSource.getRepository(this.wallet)
            const wallet = await walletRepository.findOne({
                where: { user: { id: userId } },
                relations: ["user"]
            });

            if (!wallet)
                throw new AppError(
                    `You don't have a wallet. Please contact the administrator`,
                    "false", false
                );
            return wallet.balance;
        } catch (error: any) {
            throw new AppError(`${error.message}`, "failed", false);
        }
    }

    async changePin(userId: string, oldPin: string, newPin: string) {
        try {
            const walletRepository = AppDataSource.getRepository(this.wallet);
            const wallet = await walletRepository.findOne({
                where: { user: { id: userId } },
                relations: ["user"]
            });

            if (!wallet) throw new AppError("No wallet associated with this account", "false", false);

            const validPin = await bcrypt.compare(oldPin, wallet.transaction_pin);
            if (!validPin) throw new AppError("Invalid old transaction pin", "false", false);

            const salt = await bcrypt.genSalt(10);
            const hashedNewPin = await bcrypt.hash(newPin, salt);

            wallet.transaction_pin = hashedNewPin;
            await walletRepository.save(wallet);

            return wallet;
        } catch (error: any) {
            throw new AppError(`${error.message}`, "failed", false);
        }
    }
}