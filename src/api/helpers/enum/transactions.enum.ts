enum TransactionStatus {
    Pending = "Pending",
    Successful = "Successful",
    Failed = "Failed",
    Flagged = "Flagged"
};

enum TransactionType {
    Debit = "Debit",
    Credit = "Credit",
}

enum PaymentType {
    Card = "Card",
    Account = "Account",
}

export { TransactionStatus, TransactionType, PaymentType };