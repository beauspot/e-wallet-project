import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import AppError from "@/utils/appErrors";
import { plainToInstance } from "class-transformer";
import { UserService } from "@/services/auth.service";
import { ExtendRequest } from "@/interfaces/extendRequest.interface";

export class UserController {
    constructor(private userService: UserService) { }

    async registerUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { userData, pin } = req.body;
            const result = await this.userService.registerUser(userData, pin);
            res.status(StatusCodes.CREATED).json(result);
        } catch (error) {
            next(error);
        }
    }

    async loginUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { phoneNumber, password } = req.body;
            const user = await this.userService.loginUser(phoneNumber, password);
            const tokenData = await this.userService.createSendToken(user, res);
            res.status(StatusCodes.OK).json(tokenData);
        } catch (error: any) {
            next(error.message);
        }
    }

    async sendOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const { phoneNumber } = req.body;
            const otp = await this.userService.SendOtp(phoneNumber);
            res.status(StatusCodes.OK).json({ message: "OTP sent successfully", otp });
        } catch (error: any) {
            next(error.message);
        }
    }

    async verifyOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const { phoneNumber, otp } = req.body;
            const verified = await this.userService.VerifyOtp(phoneNumber, otp);
            res.status(StatusCodes.OK).json({ message: "OTP verified", verified });
        } catch (error: any) {
            next(error.message);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            const resetToken = await this.userService.forgotPassword(email);
            res.status(StatusCodes.OK).json({ message: "Password reset email sent", resetToken });
        } catch (error: any) {
            next(error.message);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, otp, newPassword, passwordConfirm } = req.body;
            const token = await this.userService.resetPassword(email, otp, newPassword, passwordConfirm);
            res.status(StatusCodes.OK).json({ message: "Password reset successful", token });
        } catch (error: any) {
            next(error.message);
        }
    }

    async updatePassword(req: ExtendRequest, res: Response, next: NextFunction) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req?.user?.id;  // Assume userId is extracted from a middleware
            if (!userId)
                throw new AppError("Unauthorized", "User ID is missing.", false, StatusCodes.UNAUTHORIZED);
            const token = await this.userService.updatePassword(userId, currentPassword, newPassword);
            res.status(StatusCodes.OK).json({ message: "Password updated successfully", token });
        } catch (error: any) {
            next(error.message);
        }
    }

    async verifyBvnData(req: Request, res: Response, next: NextFunction) {
        try {
            const { firstName, lastName, bvn, dob } = req.body;
            const result = await this.userService.verifyBvnData(firstName, lastName, bvn, dob);
            res.status(StatusCodes.OK).json({ message: "BVN verified", result });
        } catch (error: any) {
            next(error.message);
        }
    }
}