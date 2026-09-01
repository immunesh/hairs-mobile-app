import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../db/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { emailTransporter } from '../utils/notifications';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, firstName, lastName, phone } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, firstName, lastName, phone },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.status(201).json({ success: true, data: { user, accessToken, refreshToken } });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('Invalid credentials', 401);
  if (!user.password) {
    throw new AppError('This account uses Google Sign-In. Please continue with Google.', 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, data: { user: userWithoutPassword, accessToken, refreshToken } });
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  const { credential } = req.body;
  if (!credential) throw new AppError('Google credential is required', 400);

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new AppError('Invalid Google token', 401);

  const { sub: googleId, email, given_name, family_name, picture, email_verified } = payload;

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        googleId,
        provider: 'google',
        firstName: given_name || 'User',
        lastName: family_name || '',
        avatar: picture,
        isVerified: !!email_verified,
      },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId, avatar: user.avatar || picture },
    });
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, data: { user: userWithoutPassword, accessToken, refreshToken } });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('Refresh token required', 400);

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const decoded = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) throw new AppError('User not found', 404);

  await prisma.refreshToken.delete({ where: { token: refreshToken } });

  const newAccessToken = generateAccessToken(user.id, user.role);
  const newRefreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      phone: true, avatar: true, role: true, createdAt: true,
    },
  });
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, data: user });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('User with this email does not exist', 404);
  }

  const tempPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  await emailTransporter.sendMail({
    from: `"HairsUp" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "HairsUp — Temporary Password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#1f2937;line-height:1.6;">
        <h2 style="color:#6B21A8;">Password Reset</h2>
        <p>Hi ${user.firstName},</p>
        <p>You requested a password reset for your HairsUp account.</p>
        <p>Your temporary password is: <strong style="font-size:18px;color:#6B21A8;background-color:#F3F4F6;padding:4px 8px;border-radius:4px;font-family:monospace;">${tempPassword}</strong></p>
        <p>Please log in using this temporary password and update it in your profile settings.</p>
      </div>
    `,
  });

  res.json({ success: true, message: 'Temporary password sent to email' });
};
