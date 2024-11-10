import { promisify } from "util";
import * as jwt from "jsonwebtoken";
import crypto from "crypto"
import { Service } from "typedi";

// Entities imported
import { User } from "@/db/user.entity";
import { UserWallet } from "@/db/wallet.entity";

import { Email } from "@/utils/email";
import AppError from "@/utils/appErrors";
import { verifyBvn } from "@/utils/dojah";
import { sendOtp, verifyOtp } from "@/utils/otp"
import { AppDataSource } from "@/configs/db.config";

@Service()
export class UserService {
    
    }