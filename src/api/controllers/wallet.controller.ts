import { Service } from "typedi";
import { StatusCodes } from "http-status-codes";
import { plainToInstance } from "class-transformer";
import catchAsync from "express-async-handler";
import { Request, Response, NextFunction } from "express";

import AppError from "@/utils/appErrors";
import { WalletService } from "@/services/wallet.service";
import { ExtendRequest } from "@/interfaces/extendRequest.interface";

@Service()
export class WalletController {
    constructor(private walletService: WalletService) { }

    getWallet = catchAsync(async (req: ExtendRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.id) 
            throw new AppError("User is not authenticated.", "failed", false, StatusCodes.UNAUTHORIZED);
        
        const wallet = await this.walletService.getWallet(req.user.id);
        res.status(StatusCodes.OK).json({ success: true, data: wallet });
    });

    getBalance = catchAsync(async (req: ExtendRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.id)
            throw new AppError("User is not authenticated.", "failed", false, StatusCodes.UNAUTHORIZED);
        const balance = await this.walletService.getBalance(req.user.id);
        res.status(StatusCodes.OK).json({ success: true, data: balance });
    });

    changePin = catchAsync(async (req: ExtendRequest, res: Response, next: NextFunction) => {
        const { oldPin, newPin } = req.body;
        if (!req.user || !req.user.id)
            throw new AppError("User is not authenticated.", "failed", false, StatusCodes.UNAUTHORIZED);
        const updatedWallet = await this.walletService.changePin(req.user.id, oldPin, newPin);
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully updated wallet transaction pin.",
            data: updatedWallet,
        });
    });
}