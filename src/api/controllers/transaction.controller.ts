import { Service } from "typedi";
import catchAsync from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import AppError from "@/utils/appErrors";
import { TransactionService } from "@/services/transaction.service";
import { ExtendRequest } from "@/interfaces/extendRequest.interface";

@Service()
export class TransactionController {
    constructor(private transactionService: TransactionService) { }

    getTransaction = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const transaction = await this.transactionService.getTransaction(req.params.ref);
        res.status(200).json({ success: true, data: transaction });
    });

    getTransactions = catchAsync(async (req: ExtendRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.id)
            throw new AppError("User is not authenticated.", "failed", false, StatusCodes.UNAUTHORIZED);
        const transactions = await this.transactionService.getTransactions(req.user.id);
        res.status(200).json({ success: true, data: transactions });
    });

    verifyTransaction = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const transaction = await this.transactionService.verifyTransactionStatus(req.body);
        res.status(200).json({ success: true, data: transaction });
    });
}
