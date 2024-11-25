import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "@/db/user.entity";
import { UserWallet } from "@/db/wallet.entity";
import { SettlementAcct } from "@/db/settlementAccts.entity";
import { UserTransactionModel } from "@/db/transactions.entity";

// Set up the in-memory SQLite database for tests
export const AppDataSource = new DataSource({
    type: "sqlite",
    database: ":memory:",
    synchronize: true,
    logging: false,
    entities: [User,
        UserWallet,
        SettlementAcct,
        UserTransactionModel,],
});

beforeAll(async () => {

    await AppDataSource.initialize();
});

afterAll(async () => {
    await AppDataSource.destroy();
});
