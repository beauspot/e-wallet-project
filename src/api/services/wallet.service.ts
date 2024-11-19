import { Service } from "typedi";
import bcrypt from "bcryptjs";

import { User } from "@/db/user.entity";
import AppError from "@/utils/appErrors";
import { UserWallet } from "@/db/wallet.entity";
import { AppDataSource } from "@/configs/db.config";
import { generateReference } from "@/utils/generateRef";
import { TransactionType, TransactionStatus, PaymentType } from "@/enum/transactions.enum"
import { Flw } from "@/api/helpers/integrations/flutterwave";
import { UserTransactionModel } from "@/db/transactions.entity";
import { CardChargePayload, TransferPayload, AuthorizeCardPaymentPayload } from "@/interfaces/flutterwave.interface";

@Service()
export class WalletService {
    constructor(private wallet: typeof UserWallet, private flw: Flw, private transaction: typeof UserTransactionModel, private user: typeof User) { }

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

    async deposit(payload: CardChargePayload, userEmail: string) {
        try {
            payload.email = payload.email || userEmail;
            payload.tx_ref = generateReference("transaction");
            payload.enckey = process.env.FLUTTERWAVE_ENCRYPTION_KEY;

            const response = await this.flw.chargeCard(payload);
            return response;
        } catch (error: any) {
            throw new AppError(`${error.message}`, "failed", false);
        }

    }

    async authorize(payload: AuthorizeCardPaymentPayload, sessionData: any) {
        try {
            payload.flw_ref = sessionData?.reCallCharge?.data?.flw_ref || payload.flw_ref;
            const response = await this.flw.authorizeCardPayment(payload);
            return response;
        } catch (error: any) {
            throw new AppError(`${error.message}`, "failed", false);
        }
    }

    async transfer(payload: TransferPayload, userId: string) {
        try {
            const walletRepository = AppDataSource.getRepository(this.wallet);
            const wallet = await walletRepository.findOne({
                where: { user: { id: userId } },
                relations: ["user"]
            });
            if (!wallet) throw new AppError("Wallet not found", "false", false);

            const validPin = bcrypt.compare(payload.transactionPin, wallet.transaction_pin);
            if (!validPin) throw new AppError("Invalid transaction pin", "false", false);

            if (wallet.balance < payload.amount || wallet.balance - payload.amount <= 100) {
                throw new AppError("Insufficient funds or minimum balance required", "false", false);
            }

            const details = {
                account_number: payload.account_no,
                account_bank: payload.bank,
            };

            await this.flw.verifyAccount(details);

            const transferPayload = {
                ...payload,
                reference: generateReference("transfer"),
                callback_url: `${process.env.APP_BASE_URL}/api/v1/wallet/transfer/verify`,
            };

            const response = await this.flw.transfer(transferPayload);

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id: userId } });

            if (!user)
                throw new AppError("User not found", "false", false);


            const transaction = {
                reference: response.data.reference,
                gatewayReference: response.data.flw_ref || "N/A",
                transactionType: TransactionType.Debit,
                paymentType: PaymentType.Account,
                amount: response.data.amount,
                currency: response.data.currency,
                recipient: response.data.account_number.replace(/(?<=.{4})./g, "*"),
                description: response.data.narration,
                user: { id: userId },
                status: response.data.status === "NEW"
                    ? TransactionStatus.Pending
                    : response.data.status === "FAILED"
                        ? TransactionStatus.Failed
                        : TransactionStatus.Successful,
            };

            const transactionRepo = AppDataSource.getRepository(this.transaction);
            const wallet_transaction = transactionRepo.create(transaction)
            await transactionRepo.save(wallet_transaction);
            return wallet_transaction;

        } catch (error: any) {
            throw new AppError(`${error.message}`, "failed", false);
        }
    }
}