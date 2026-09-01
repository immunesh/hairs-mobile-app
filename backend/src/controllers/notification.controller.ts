import { Response } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ success: true, data: notifications });
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  const count = await prisma.notification.count({
    where: { userId: req.user!.userId, isRead: false },
  });
  res.json({ success: true, data: { count } });
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.notification.updateMany({
    where: { id, userId: req.user!.userId },
    data: { isRead: true },
  });
  res.json({ success: true });
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, isRead: false },
    data: { isRead: true },
  });
  res.json({ success: true });
};
