import { Service } from "typedi";
import AppError from "@/utils/appErrors";
import { UserTransactionModel } from "@/db/transactions.entity";
import { TransactionServiceInterface } from "@/interfaces/transaction.interface";
import { TransactionStatus } from "@/enum/transactions.enum";

@Service()
export class TransactionService implements TransactionServiceInterface {
    constructor(private transaction: typeof UserTransactionModel) { }
    async getTransaction(reference: string): Promise<UserTransactionModel> {
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

    async getTransactions(userId: string): Promise<UserTransactionModel[]> {
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

    async verifyTransactionStatus(data: Partial<UserTransactionModel>): Promise<UserTransactionModel | null> {
        try {
            const { status, reference } = data;
    
            const transaction = await this.transaction.findOne({
                where : { reference },
            });

            if (!transaction) {
                return null; 
            }
    
        
            if (status === TransactionStatus.Successful) {
                transaction.status = TransactionStatus.Successful;
            } else if (status === TransactionStatus.Failed) {
                transaction.status = TransactionStatus.Failed;
            } else {
                throw new AppError(`Invalid transaction status: ${status}`, "failed", false);
            }
                await this.transaction.save(transaction);
      
            return transaction;
        } catch (error: any) {
            throw new AppError(`${error.message}`, "failed", false);
        }
    }
}
