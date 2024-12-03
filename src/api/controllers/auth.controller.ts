import { Service } from "typedi";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import logging from "@/utils/logging"
import AppError from "@/utils/appErrors";
import { plainToInstance } from "class-transformer";
import { UserService } from "@/services/auth.service";
import { ExtendRequest } from "@/interfaces/extendRequest.interface";

@Service()
export class UserController {
    constructor(private userService: UserService) { }

    async registerUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { userData, pin } = req.body;
            const result = await this.userService.registerUser(userData, pin);
            res.status(StatusCodes.CREATED).json(result);
        } catch (error: any) {
            // console.error(error);
            throw new AppError(`${error.message}`, "failed", false, StatusCodes.SERVICE_UNAVAILABLE)
        }
    }

    async loginUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { phoneNumber, password } = req.body;
            const user = await this.userService.loginUser(phoneNumber, password);
            const tokenData = await this.userService.createSendToken(user, res);
            res.status(StatusCodes.OK).json(tokenData);
        } catch (error: any) {
            throw new AppError(`${error.message}`, "failed", false, StatusCodes.SERVICE_UNAVAILABLE)
        }
    }

    /*
    async sendOtp(req: Request, res: Response, next: NextFunction) {
        const { phoneNumber } = req.body;
        logging.info(phoneNumber)
        const otp = await this.userService.SendOtp(phoneNumber);
        res.status(StatusCodes.OK).json({ message: "OTP sent successfully", otp });
    }

    async verifyOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const { phoneNumber, otp } = req.body;
            const verified = await this.userService.VerifyOtp(phoneNumber, otp);
            res.status(StatusCodes.OK).json({ message: "OTP verified", verified });
        } catch (error: any) {
            throw new AppError(`${error.message}`, "failed", false, StatusCodes.SERVICE_UNAVAILABLE)
        }
    }


    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            const resetToken = await this.userService.forgotPassword(email);
            res.status(StatusCodes.OK).json({ message: "Password reset email sent", resetToken });
        } catch (error: any) {
            throw new AppError(`${error.message}`, "failed", false, StatusCodes.SERVICE_UNAVAILABLE)
        }
    };

    async forgotTransactionPin(req: Request, res: Response) {
        const { email } = req.body;
        try {
            const result = await this.userService.forgotTransactionPin(email);
            return res.json({ message: "Reset OTP sent", resetToken: result });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, otp, newPassword, passwordConfirm } = req.body;
            const token = await this.userService.resetPassword(email, otp, newPassword);
            res.status(StatusCodes.OK).json({ message: "Password reset successful", token });
        } catch (error: any) {
            throw new AppError(`${error.message}`, "failed", false, StatusCodes.SERVICE_UNAVAILABLE)
        }
    };

    async resetTransactionPin(req: Request, res: Response) {
        const { email, otp, newPin } = req.body;
        try {
            const result = await this.userService.resetTransactionPin(email, otp, newPin);
            return res.json({ message: "Transaction pin reset successfully", token: result });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    };

    async updatePassword(req: ExtendRequest, res: Response, next: NextFunction) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req?.user?.id;  // Assume userId is extracted from a middleware
            if (!userId)
                throw new AppError("Unauthorized", "User ID is missing.", false, StatusCodes.UNAUTHORIZED);
            const token = await this.userService.updatePassword(userId, currentPassword, newPassword);
            res.status(StatusCodes.OK).json({ message: "Password updated successfully", token });
        } catch (error: any) {
            throw new AppError(`${error.message}`, "failed", false, StatusCodes.SERVICE_UNAVAILABLE)
        }
    };

    async updateTransactionPin(req: Request, res: Response) {
        const { userId, currentPin, newPin } = req.body;
        try {
            const result = await this.userService.updateTransactionPin(userId, currentPin, newPin);
            return res.json({ message: "Transaction pin updated successfully", token: result });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    };
    async verifyBvnData(req: Request, res: Response, next: NextFunction) {
        try {
            const { firstName, lastName, bvn, dob } = req.body;
            const result = await this.userService.verifyBvnData(firstName, lastName, bvn, dob);
            res.status(StatusCodes.OK).json({ message: "BVN verified", result });
        } catch (error: any) {
            throw new AppError(`${error.message}`, "failed", false, StatusCodes.SERVICE_UNAVAILABLE)
        }
    };
    */

    async logoutUser(req: Request, res: Response) {
        // Call the logout service to clear the jwt cookie 
        await this.userService.logout(res);
        res.status(StatusCodes.OK).json({ status: `${res.locals.user}, successful` });
    };
}