import { User } from "@/db/user.entity";
import AppError from "@/utils/appErrors";
import { AppDataSource } from "@/configs/db.config";


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

const sendOtp = async (phoneNumber: string) => {
    const existingUser = await AppDataSource.getRepository(User).findOne({
        where: { phoneNumber }
    });

    if (existingUser) {
        throw new AppError(`user already exists, Login`, "400", false);
    }
    const client = require("twilio")(accountSid, authToken);

    try {
        const verification = await client.verify.v2
            .services(serviceSid)
            .verifications.create({ to: phoneNumber, channel: "sms" });
        return verification;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const verifyOtp = async (phoneNumber: string, otp: string) => {
    const client = require("twilio")(accountSid, authToken);

    try {
        const verificationCheck = await client.verify.v2
            .services(serviceSid)
            .verificationChecks.create({ to: phoneNumber, code: otp });
        console.log("verificationCheck", verificationCheck);
        return verificationCheck.status;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export { sendOtp, verifyOtp };