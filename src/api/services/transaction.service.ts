import { Service } from "typedi";
import { UserTransactionModel } from "@/db/transactions.entity";
import AppError from "@/utils/appErrors";

@Service()
export class TransactionService {
    constructor(private transaction: typeof UserTransactionModel) { }
    async getTransaction(reference: string) {
        try {
            const transaction = await this.transaction.findOne({
                where: { reference },
            });
    
            if (!transaction) 
                throw new AppError(`No transaction with the ref [${reference}]`, "failed", false);
    
            return transaction;   
        } catch (error: any) {
            throw new AppError(`${error.message}`, "failed", false);
        }
    }

    async getTransactions(userId: string) {
        try {
            const transactions = await this.transaction.find({
                where: { user: {id: userId}},
            });
            if (!transactions || transactions.length === 0) {
                throw new AppError(`You don't have any transactions`, "failed", false);
            }
            return transactions;
        } catch (error: any) {
            throw new AppError(`${error.message}`, "failed", false);
        }
    }

    async verifyTransactionStatus(data: any) {
        try {
            const { status, reference } = data.data.data;
            const query = { reference };
            let updateQuery = {};
    
            const transaction = await this.transaction.findOne({
                where : {reference},
            });
    
            if (transaction) {
                if (status === "SUCCESSFUL") {
                    updateQuery = { status: "successful" };
                } else if (status === "FAILED") {
                    updateQuery = { status: "failed" };
                }
                await this.transaction.save(transaction);
            }
            return transaction;
        } catch (error: any) {
            throw new AppError(`${error.message}`, "failed", false);
        }
    }
}
