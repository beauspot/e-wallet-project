import supertest from "supertest"
import { DataSource } from 'typeorm';

import { createApp } from "@/app";

import { User } from "@/db/user.entity";
import { UserWallet } from "@/db/wallet.entity";
import { SettlementAcct } from "@/db/settlementAccts.entity";
import { UserTransactionModel } from "@/db/transactions.entity";

export const TestDataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [
        User,
        UserWallet,
        SettlementAcct,
        UserTransactionModel,
    ],
});

const app = createApp();

describe("index route", () => {
    it("should return the contents of the index endpoint", async () => {
        const { text, statusCode } = await supertest(app).get("/");

        expect(statusCode).toBe(200);
        expect(text).toBe('<h1>E-Wallet API Documentation</h1><a href="/api-docs">Documentation</a>');
    });
});
