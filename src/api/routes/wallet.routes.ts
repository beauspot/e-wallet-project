import { Router, Request, Response, NextFunction } from "express";
import { WalletController } from "@/controllers/wallet.controller";
import { UserWallet } from "@/db/wallet.entity";
import { protect } from "@/middlewares/protect";
import { WalletService } from "@/services/wallet.service";
import { validate } from "@/helpers/middlewares/validate";

const walletService = new WalletService(UserWallet);
const walletController = new WalletController(walletService);

const router = Router();

router.use(protect);
router.route("/wallet").get((req: Request, res: Response, next: NextFunction) => walletController.getWallet(req, res, next));

router.route("/balance").get((req: Request, res: Response, next: NextFunction) => walletController.getBalance(req, res, next));

// TODO: implement a validation schema on this field
router.route("/change-pin").get((req:Request, res:Response, next:NextFunction) => walletController.changePin(req, res, next));


export default router;