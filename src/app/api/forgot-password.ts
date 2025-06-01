import type { NextApiRequest, NextApiResponse } from "next";
import { db } from '~/server/db';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    console.log('Finding user by email:', email);

    const user = await db.user.findUnique({ where: { email } });
    console.log('User found:', !!user);

    // Security: always return same message regardless of user existence
    if (!user) {
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 3600000); // 1 hour

    console.log('Generated token:', token);
    console.log('Token expires at:', tokenExpires);

    await db.user.update({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: { email },
      data: {
        emailToken: token,
        tokenExpires,
      },
    });
    console.log('User updated with reset token');

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const baseUrl = `${req.headers["x-forwarded-proto"] ?? "https"}://${req.headers.host}`;
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'myapp.test.email@gmail.com',
        pass: 'parolaparola', // Replace with your app password or real password (securely)
      },
    });

    const info = await transporter.sendMail({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      to: email,
      from: 'no-reply@Gifthub.com',
      subject: 'Reset your GiftHub password',
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    console.log('Reset email sent:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Error in forgot-password handler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}