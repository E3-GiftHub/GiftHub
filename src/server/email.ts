import nodemailer from 'nodemailer';
import { env } from '~/env.js';

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});


export interface EmailOptions {
    to: string;
    subject: string;
    html?: string;
    text?: string;
}

export async function sendEmail(options: EmailOptions) {
    try {
        const info = await transporter.sendMail({
            from: env.SMTP_USER,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });

        console.log('Email trimis cu succes:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Eroare la trimiterea email-ului:', error);
        return { success: false, error };
    }
}