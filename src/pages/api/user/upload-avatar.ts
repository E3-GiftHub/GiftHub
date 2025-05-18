import { IncomingForm, type Fields, type Files } from 'formidable';
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), '/public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    multiples: false,
  });

  try {
    const { fields, files } = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(new Error(err instanceof Error ? err.message : String(err)));
        } else {
          resolve({ fields, files });
        }
      });
    });

    const username = typeof fields.username === 'string' ? fields.username : fields.username?.[0];
    const uploadedFile = files.file;
    const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;

    if (!username) {
      return res.status(400).json({ error: 'Missing or invalid username' });
    }

    if (!file?.filepath) {
      return res.status(400).json({ error: 'Invalid file upload' });
    }

    const fileName = path.basename(file.filepath);
    const relativePath = `/uploads/${fileName}`;

    // Update the user's picture with the new image path
    const updatedUser = await prisma.user.update({
      where: { username },
      data: { pictureUrl: relativePath },
    });

    // Check the updated user
    console.log('Updated User:', updatedUser);

    return res.status(200).json({
      message: 'Profile picture updated successfully',
      picture: relativePath,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
