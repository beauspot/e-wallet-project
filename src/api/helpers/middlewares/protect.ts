import jwt from "jsonwebtoken";
import { promisify } from "util";
import ExpressAsync from "express-async-handler";
import { Request, Response, NextFunction } from "express";

import { User } from "@/db/user.entity";
import AppError from "@/utils/appErrors";
import { AppDataSource } from "@/configs/db.config";
import { DecodedToken } from "@/interfaces/user.interface";
import { ExtendRequest } from "@/interfaces/extendRequest.interface";

const UserRepository = AppDataSource.getRepository(User);

// Helper function for JWT verification.
const verifyToken = (token: string, secret: string): Promise<DecodedToken> => new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded as DecodedToken);
    })
})

export const protect = ExpressAsync(
    async (req: ExtendRequest, res: Response, next: NextFunction) => {
        // 1) Getting the token & check if it exists
        let token: string | undefined;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies?.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return next(new AppError("You are not logged in", "failed to get token", false, 401));
        }

        // 2) Verify token
        const decoded = await verifyToken(token, process.env.JWT_SECCRET as string)

        // 3) Check if user still exists
        const currentUser = await UserRepository.findOneBy({ id: decoded.id });
        if (!currentUser) {
            return next(new AppError("The user belonging to this token nolonger exists.", "failed to get user", false, 401));
        }

        // 4) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next(new AppError("User recently changed password! Please login again", "password already changed", false, 401,))
        };

        // grant access to the protected endpoint
        req.user = currentUser;
        res.locals.user = currentUser;
        next()
    }
)