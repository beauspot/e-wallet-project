interface CardChargePayload {
    card_number: string;
    cvv: number;
    expiry_month: string;
    expiry_year: string;
    currency: string;
    amount: string;
    tx_ref: string;
    email?: string;
    phone_number?: string;
    fullname?: string;
    pin?: string;
}

interface AuthorizeCardPaymentPayload {
    otp: string;
    flw_ref: string;
    userId: string;
}


export { CardChargePayload, AuthorizeCardPaymentPayload };