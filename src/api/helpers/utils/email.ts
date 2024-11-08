import * as nodemailer from "nodemailer";

interface User {
    email: string;
    firstName: string;
}

export class Email {
    private to: string;
    private firstName: string;
    private resetToken: string;
    private from: string;

    constructor(user: User, resetToken: string) {
        this.to = user.email;
        this.firstName = user.firstName;
        this.resetToken = resetToken;
        this.from = `SpecsPay <${process.env.EMAIL_FROM}>`;
    }

    private newTransport() {
        return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || "Gmail",
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    // Send the actual email
    private async send(subject: string, template: string) {
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html: template,
        };
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send("Welcome", `<h1>Welcome to E-walletPay, ${this.firstName}!</h1>`);
    }

    async sendPasswordReset() {
        await this.send(
            "Password Reset OTP",
            `<p>Forgot your password? Your One-Time Password to reset your password is <strong>${this.resetToken}</strong>. It is valid for only 10 minutes.</p>`
        );
    }
};
