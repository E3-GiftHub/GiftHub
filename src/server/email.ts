import nodemailer from 'nodemailer';
import { env } from '~/env.js';

// transporter for serverless environments
const createTransporter = () => {
  const useSSL = Number(env.SMTP_PORT) === 465;
  
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: useSSL,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },  // mai jos e ca un fel de if, daca vercel pune development atunci se relaxeaza niste restrictii
    ...(env.NODE_ENV === 'development' && { tls: { rejectUnauthorized: false }}),
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });
};

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions) {
  // create fresh transporter for each email (serverless best practice)
  const transporter = createTransporter();
  
  try {
    const info = await transporter.sendMail({
      from: String(env.SMTP_FROM ?? env.SMTP_USER),
      ...options,
    });
    
    console.log('Mail sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err: unknown) {
    console.error('Mail error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    // previne hanging connection in serverless environments 
    transporter.close();
  }
}
