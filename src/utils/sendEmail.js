const nodemailer = require("nodemailer");

const sendResetPasswordEmail = async (to, emailSubject, emailContent) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "email-smtp.ap-south-1.amazonaws.com", // Change to your AWS region
            port: 465,
            secure: true, // Use TLS
            auth: {
                user: process.env.AWS_SES_SMTP_USER, // Your AWS SMTP credentials
                pass: process.env.AWS_SES_SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to,
            subject: emailSubject,
            html: emailContent,
        });
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

const welcomeEmail = async (to, emailSubject, emailContent) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "email-smtp.ap-south-1.amazonaws.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.AWS_SES_SMTP_USER,
                pass: process.env.AWS_SES_SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to,
            subject: emailSubject,
            html: emailContent,
        });
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports = { sendResetPasswordEmail, welcomeEmail };
