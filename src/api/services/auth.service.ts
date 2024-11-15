import { promisify } from "util";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import crypto from "crypto"
import { Service } from "typedi";
import { Response } from "express";

// Entities imported
import { User } from "@/db/user.entity";
import { UserWallet } from "@/db/wallet.entity";

import { Email } from "@/utils/email";
import AppError from "@/utils/appErrors";
import { verifyBvn } from "@/utils/dojah";
import { TwilioConfig } from "@/api/helpers/utils/twilio"
import { AppDataSource } from "@/configs/db.config";
import { userInterface } from "@/interfaces/user.interface";

@Service()
export class UserService {
    
    constructor(private userEntity: typeof User, private userwalletEntity: typeof UserWallet, public twilio: TwilioConfig) { }

    async SendOtp(phoneNumber: string) {
        const otp = await this.twilio.sendOtp(phoneNumber);
        return otp;
    }

    async VerifyOtp(phoneNumber: string, otp: string) {
        const verifiedOTP = await this.twilio.verifyOtp(phoneNumber, otp);
        return verifiedOTP;
    }

    signToken(userId: string): string {
        return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
    };

    private createPasswordResetToken(user: User) {
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiration
        return resetToken;
    }

    // not needed as it already takes place on the corresponding model.
    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 12;
        return bcrypt.hash(password, saltRounds);
    };

    // Private method: Verify password for signing in
    private async verifyPassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(inputPassword, hashedPassword);
    };

    private async hashPin(pin: string): Promise<string> {
        const saltRounds = 12;
        return bcrypt.hash(pin, saltRounds);
    }

    private async verifyPin(pin: string, hashedPin: string): Promise<boolean> {
        return bcrypt.compare(pin, hashedPin)
    }

    // TODO: this belongs to the controller => Remember!!!
    async createSendToken(user: User, res: Response) {
        const token = this.signToken(user.id);

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN!) * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: res.req.secure || res.req.headers["x-forwarded-proto"] === "https",
        });

        if (!user.password) undefined;
        return { user, token };
    };

    // TODO: There are 2 categories of users admin & customer.
    // TODO: need to setup endpoint to check for customer & admin
    async registerUser(userData: Partial<userInterface>, pin: string) {
        try {
            const hashedPin = await this.hashPin(pin);
            const hashedPassword = userData.password ? await this.hashPassword(userData.password) : undefined;

            const UserRepository = AppDataSource.getRepository(this.userEntity)
            const user = UserRepository.create({ ...userData, password: hashedPassword});
            const savedUser = await UserRepository.save(user);

            const UserWalletRepo = AppDataSource.getRepository(this.userwalletEntity)
            const wallet = UserWalletRepo.create({
                transaction_pin: hashedPin,
                user: savedUser,
            });
            const savedWallet = await UserWalletRepo.save(wallet);

            return { user: savedUser, wallet: savedWallet };
        } catch (error: any) {
            // logging.log(`error message: ${error.message}`);
            throw new AppError("Error registering user", `${error.message}`, false);
        }
    };

    async loginUser(phoneNumber: string, password: string) {
        if (!phoneNumber || !password) throw new AppError("Provide phone and password!", "failed", false);
        try {
            const user = await AppDataSource.getRepository(this.userEntity).findOne({ where: { phoneNumber }, select: ["password"] });

            if (!user || !(await this.verifyPassword(password, user.password)))
                throw new AppError("Incorrect password", "failed", false);

            return user;
        } catch (error: any) {
            // logging.error(`Error in user: ${error.message}`);
            throw new AppError("login failed", `${error.message}`, false);
        }
    }

    async verifyBvnData(firstName: string, lastName: string, bvn: string, dob: Date) {
        try {
            const result = await verifyBvn(firstName, lastName, bvn, dob);
            if (!result) throw new AppError("BVN verification failed", "failed", false);
            return result;
        } catch (error: any) {
            // logging.log(`error message: ${error.message}`);
            throw new AppError("Error Verrifying BVN", `${error.message}`, false);
        }
       
    }

    async forgotPassword(email: string) {
        try {
            const user = await AppDataSource.getRepository(this.userEntity).findOne({ where: { email } });
            if (!user) throw new Error("There is no user with that email address.");
    
            const resetToken = this.createPasswordResetToken(user);
            await AppDataSource.getRepository(this.userEntity).save(user);
    
            await new Email(user, resetToken).sendPasswordReset();
            return resetToken;
        } catch (error: any) {
            throw new AppError("Error", `${error.message}`, false);
        }
    }

    async resetPassword(email: string, otp: string, newPassword: string, passwordConfirm: string) {
        const hashedToken = crypto.createHash("sha256").update(otp).digest("hex");
        try {
            const user = await AppDataSource.getRepository(this.userEntity).findOne({ where: { email } });

            if (!user || user.passwordResetToken !== hashedToken || user.passwordResetExpires! < new Date()) {
                throw new Error("Invalid OTP or OTP has expired.");
            }

            user.password = await bcrypt.hash(newPassword, 12);
            user.passwordResetToken = "" ;
            user.passwordResetExpires = new Date() || undefined;

            await AppDataSource.getRepository(this.userEntity).save(user);

            return this.signToken(user.id);
        } catch (error: any) {
            throw new AppError("Error", `${error.message}`, false);
        }
     
    }

    async updatePassword(userId: string, currentPassword: string, newPassword: string) {
        try {
            const user = await AppDataSource.getRepository(this.userEntity).findOne(
                {
                    where: { id: userId },
                    select: ["password"]
                });

            if (!user || !(await this.verifyPassword(currentPassword, user.password))) {
                throw new Error("Your current password is wrong.");
            }

            user.password = await bcrypt.hash(newPassword, 12);

            await AppDataSource.getRepository(this.userEntity).save(user);

            return this.signToken(user.id);
        } catch (error: any) {
            throw new AppError("Error", `${error.message}`, false);
        }
    }

    async logout(res: Response) {
        // set the cookie to expire immediately
        res.cookie("jwt", "loggedout", {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        })
    }
}
