const nodemailer = require("nodemailer");

const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.NORMAL_SENDER_EMAIL,
            pass: process.env.NORMAL_EMAIL_PASS,
        },
    });
};

const sendEmail = async (to, subject, content) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.NORMAL_SENDER_EMAIL,
            to,
            subject,
            text: content,
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error.message, error.stack);
        return { success: false, error: error.message };
    }
};

const sendResetPasswordEmail = async (to, subject, content) => {
    return sendEmail(to, subject, content);
};

const welcomeEmail = async (to, subject, content) => {
    return sendEmail(to, subject, content);
};

const sendOtpEmail = async (to, otp) => {
    const subject = "Your Access Code is Here!";
    const content = `Hello,

Use the code below to verify your account:

🔑 ${otp}

This code will expire in 10 minutes.

If you didn’t request this, you can ignore this email.

Best,  
Tinder for Devs Team`;

    return sendEmail(to, subject, content);
};

const cronEmail = async (to, subject, content) => {

    return sendEmail(to, subject, content);
};

module.exports = { sendResetPasswordEmail, welcomeEmail, sendOtpEmail, cronEmail };
