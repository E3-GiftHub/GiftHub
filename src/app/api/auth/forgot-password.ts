import type { NextApiRequest, NextApiResponse } from "next";
import { db } from '~/server/db'; // Adjust the import path as needed
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
    // Check if the user exists
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      // For security, don't reveal whether the email exists
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with the reset token and expiration
    // @ts-expect-error
    await db.user.update({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: { email },
      data: {
        emailToken: token,
        tokenExpires,
      },
    });

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const baseUrl = `${req.headers["x-forwarded-proto"] ?? "https"}://${req.headers.host}`;
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Configure the email transporter
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Use your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send the email
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await transporter.sendMail({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Reset your password',
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Error in forgot-password handler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
