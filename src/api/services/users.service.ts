import { promisify } from "util";
import * as jwt from "jsonwebtoken";



import { User } from "@/db/user.entity";
import {sendOtp, verifyOtp} from "@/utils/otp"
import { UserWallet } from "@/db/wallet.entity";
import { AppDataSource } from "@/configs/db.config";