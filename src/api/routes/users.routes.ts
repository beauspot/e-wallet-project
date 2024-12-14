import { Router, Request, Response, NextFunction } from "express";
import { User } from "@/db/user.entity";
import { TwilioConfig } from "@/api/helpers/integrations/twilio"
import { protect } from "@/middlewares/protect";
import { UserWallet } from "@/db/wallet.entity";
import { UserService } from "@/services/auth.service";
import { validate } from "@/helpers/middlewares/validate";
import { UserController } from "@/controllers/auth.controller";
import { ExtendRequest } from "@/interfaces/extendRequest.interface";

const twilioConfigInstance = new TwilioConfig("", "");
const user_service = new UserService(User, UserWallet, twilioConfigInstance);
const user_controller = new UserController(user_service);


const router = Router();

// Send OTP => POST
// router.route("/send_otp").post((req: Request, res: Response, next: NextFunction) => user_controller.sendOtp(req, res, next));

// Verify OTP => POST
// router.route("/verify_otp").post((req: Request, res: Response, next: NextFunction) => user_controller.verifyOtp(req, res, next));

// Verify BVN => GET
// router.route("/verify_bvn").get((req: Request, res: Response, next: NextFunction) => user_controller.verifyBvnData(req, res, next));

router.route("/register").post((req: Request, res: Response, next: NextFunction) => user_controller.registerUser(req, res, next))

router.route("/login").post((req: Request, res: Response, next: NextFunction) => user_controller.loginUser(req, res, next));

// Loout => GET
router.route("/logout").get((req: Request, res: Response, next: NextFunction) => user_controller.logoutUser(req, res));

// fgt pwd => POST
// router.route("/forgot_password").post((req: Request, res: Response, next: NextFunction) => user_controller.forgotPassword(req, res, next));

// reset pwd => PATCH
// router.route("/reset_password").patch((req: Request, res: Response, next: NextFunction) => user_controller.resetPassword(req, res, next));

// Protecting all routes after this middleware
router.use(protect);

// TODO: remember to validate the transaction Pin with zod so the length should be 4.
router.route("/transaction_pin").post((req: Request, res: Response, next: NextFunction) => user_controller.createTransactionPin(req, res, next));

router.route("/forgot-pin").post((req: Request, res: Response, next: NextFunction) => user_controller.forgotTransactionPin(req, res));

router.route("/reset-pin").post((req: Request, res: Response, next: NextFunction) => user_controller.resetTransactionPin(req, res));

router.route("/update-pin").patch((req: Request, res: Response) => user_controller.updateTransactionPin(req, res));

// update pwd => PATCH
// router.route("/update_password").patch((req: Request, res: Response, next: NextFunction) => {
    // user_controller
        // .updatePassword(req as ExtendRequest, res, next)
        // .catch(next)
// });

export default router;