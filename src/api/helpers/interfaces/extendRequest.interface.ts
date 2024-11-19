import { Request } from "express";

// TODO: would come back to this issue
import { User } from "@/db/user.entity";
export interface ExtendRequest extends Request {
    user?: {
        id?: string;
        email?: string;
    }
};