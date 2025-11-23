import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: "rkoko5095@gmail.com", // Provided by user
        pass: "llbw ccnr auil lgyk", // Provided by user
    },
});

export const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"Foodie App" <rkoko5095@gmail.com>', // sender address
            to, // list of receivers
            subject, // Subject line
            html, // html body
        });

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
