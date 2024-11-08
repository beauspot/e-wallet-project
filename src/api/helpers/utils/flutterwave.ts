import Flutterwave from "flutterwave-node-v3";


import logging from "@/utils/logging";
import AppError from "@/utils/appErrors";
import { AppDataSource } from "@/configs/db.config";
import { TransactionStatus, TransactionType, PaymentType } from "@/enum/transactions.enum"
import { UserTransactionModel } from "@/db/transactions.entity";
import { CardChargePayload, AuthorizeCardPaymentPayload, TransferPayload, SubAccounts } from "@/interfaces/flutterwave.interface";

const flw = new Flutterwave(
    `${process.env.FLUTTERWAVE_PUBLIC_KEY}`,
    `${process.env.FLUTTERWAVE_SECRET_KEY}`
);



const chargeCard = async (payload: CardChargePayload) => {
    try {
        const response = await flw.Charge.card(payload);
        let reCallCharge;

        if (response.status == "error") {
            throw new Error(response.message);
        }

        // Authorizing transactions
        if (response.meta.authorization.mode === "pin") {
            let chargePayload = {
                ...payload,
                authorization: {
                    mode: "pin",
                    fields: ["pin"],
                    pin: payload.pin!,
                }
            };
            reCallCharge = await flw.Charge.card(chargePayload);
        };
        return reCallCharge;
    } catch (error: any) {
        throw new AppError(error.message, "400", false);
    }
};

const authorizeCardPayment = async (payload: AuthorizeCardPaymentPayload) => {
    // Add the OTP to authorize the transaction
    let transaction;
    let updateData = {
        reference: "",
        gatewayReference: "",
        transactionType: TransactionType.Debit || TransactionType.Credit,
        amount: 0,
        currency: "₦",
        receipient: "",
        status: TransactionStatus.Pending || TransactionStatus.Successful || TransactionStatus.Failed || TransactionStatus.Flagged,
        paymentType: PaymentType.Card || PaymentType.Account,
        description: "",
        deviceFingerprint: "",
        user: { id: payload.userId }, // use a partial entity object for `user` because of Typeorm
    };

    try {
        const response = await flw.Charge.validate({
            otp: payload.otp,
            flw_ref: payload.flw_ref,
        });

        logging.log(response);

        updateData.reference = response.data.tx_ref;
        updateData.gatewayReference = response.data.flw_ref;
        updateData.paymentType = response.data.payment_type as PaymentType;
        updateData.transactionType = response.data.transaction_type as TransactionType;
        updateData.amount = Number(response.data.amount);
        updateData.status = response.data.status as TransactionStatus;
        updateData.description = response.data.narration;
        updateData.deviceFingerprint = response.data.device_fingerprint;
        updateData.currency = response.data.currency;
        updateData.user = response.payload.userId;

        if (
            response.data.status === "successful" ||
            response.data.status === "pending"
        ) {
            // Verify the payment
            const transactionId = response.data.id;
            transaction = await flw.Transaction.verify({ id: transactionId });

            const query = { gatewayReference: transaction.data.flw_ref };

            // TODO: anywhere you see "Transaction", change to "UserTransactionModel"
            // TODO: setting the TransactioType properly for the updateData.
            await AppDataSource.getRepository(UserTransactionModel).update(query, updateData);
            return transaction;
        }

        updateData.status = TransactionStatus.Failed || TransactionStatus.Flagged;

        // TODO: setting the TransactioType properly for the updateData.
        await AppDataSource.getRepository(UserTransactionModel).update({ gatewayReference: response.data.flw_ref }, updateData);

        return response;
    } catch (error: any) {
        logging.error("Error authorizing card payment", error.message);
        throw new AppError(error.message, "400", false);
    }
};

/*****  Transfers  *****/
const transfer = async (payload: TransferPayload) => {
    // transfer directly to another customer using myWallet
    try {
        const response = await flw.Transfer.initiate(payload);

        return response;
    } catch (error: any) {
        throw new AppError(error.message, "400", false);
    }
};

/*****  subaccount creation  *****/

const createSubaccount = async (payload: SubAccounts) => {
    try {
        const response = await flw.Subaccount.create(payload);
        logging.log(response);
    } catch (error: any) {
        logging.error(error);
    }
};
const fetchSubaccount = async (payload: SubAccounts) => {
    try {
        const response = await flw.Subaccount.fetch(payload);
        logging.log(response);
    } catch (error) {
        logging.log(error);
    }
};

module.exports = {
    chargeCard,
    authorizeCardPayment,
    transfer,
    createSubaccount,
    fetchSubaccount,
};
