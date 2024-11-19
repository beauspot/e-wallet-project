import { Router, Request, Response, NextFunction } from "express";

import { UserTransactionModel } from "@/db/transactions.entity";
import { TransactionService } from "@/services/transaction.service";
import { TransactionController } from "@/controllers/transaction.controller";
import { protect } from "@/middlewares/protect";
import { validate } from "@/helpers/middlewares/validate";

const router = Router();
const transactionService = new TransactionService(UserTransactionModel);
const transactionController = new TransactionController(transactionService);

router.use(protect)
router.route("/transactions").get((req: Request, res: Response, next: NextFunction) => transactionController.getTransaction(req, res, next));

// TODO: make sure you validate this endpoint with zod.
router.route("/verify").post((req: Request, res: Response, next: NextFunction) => transactionController.verifyTransaction(req, res, next));
router.route("/transactions/:ref").get((req: Request, res: Response, next: NextFunction) => transactionController.getTransaction(req, res, next));


export default router;