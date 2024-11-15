import twilio from "twilio";
import logging from "@/utils/logging";
import { User } from "@/db/user.entity";
import AppError from "@/utils/appErrors";
import { AppDataSource } from "@/configs/db.config";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const serviceSid = process.env.TWILIO_SERVICE_SID!;

export class TwilioConfig {
    constructor(public phoneNumber: string, protected otp: string) { }

    async sendOtp(phoneNumber: string) {
        const existingUser = await AppDataSource.getRepository(User).findOne({
            where: { phoneNumber }
        });

        if (existingUser) {
            throw new AppError(`user already exists, Login`, "400", false);
        }
        const client = twilio(accountSid, authToken);

        try {
            const formattedPhoneNumber = this.formatPhoneNumber(phoneNumber);
            const verification = await client.verify.v2
                .services(serviceSid)
                .verifications.create({ channel: "sms", to: formattedPhoneNumber, });

            logging.log({
                serviceSid,
                to: formattedPhoneNumber,
                code: this.otp,
            });

            logging.log(verification);
            logging.log(verification.status);
            logging.log(`Account SID: ${accountSid}, AuthToken: ${authToken}, Service SID: ${serviceSid}`);
            logging.log("Verification sent", verification)

            return verification;
        } catch (error: any) {
            logging.error(error.message);
            throw error;
        }
};

    async verifyOtp(phoneNumber: string, otp: string) {
        const client = twilio(accountSid, authToken);

        try {
            const verificationCheck = await client.verify.v2
                .services(serviceSid)
                .verificationChecks.create({ to: phoneNumber, code: otp });
            logging.log("verificationCheck", verificationCheck);
            return verificationCheck.status;
        } catch (error: any) {
            logging.error(error.message);
            throw error;
        }
    };

    private formatPhoneNumber(phoneNumber: string): string {
        if (!phoneNumber.startsWith("+")) {
            throw new AppError("Phone number must be in E.164 format (e.g., +1234567890)", "failed", false);
        }
        return phoneNumber;
    }
}