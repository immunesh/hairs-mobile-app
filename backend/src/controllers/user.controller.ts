import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      phone: true, avatar: true, role: true, createdAt: true,
      addresses: true,
      _count: { select: { orders: true, wishlist: true, reviews: true } },
    },
  });
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, data: user });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { firstName, lastName, phone, avatar } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { firstName, lastName, phone, avatar },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true },
  });
  res.json({ success: true, data: user });
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) throw new AppError('User not found', 404);
  if (!user.password) {
    throw new AppError('This account uses Google Sign-In and has no password to change', 400);
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new AppError('Current password is incorrect', 400);

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  res.json({ success: true, message: 'Password updated successfully' });
};

export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  const addresses = await prisma.address.findMany({ where: { userId: req.user!.userId } });
  res.json({ success: true, data: addresses });
};

export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { type, fullName, phone, line1, line2, city, state, pincode, country, isDefault } = req.body;

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user!.userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: { userId: req.user!.userId, type, fullName, phone, line1, line2, city, state, pincode, country, isDefault },
  });
  res.status(201).json({ success: true, data: address });
};

export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = req.body;

  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user!.userId }, data: { isDefault: false } });
  }

  const existingAddress = await prisma.address.findFirst({
    where: { id, userId: req.user!.userId },
  });

  if (!existingAddress) {
    throw new AppError('Address not found', 404);
  }

  const address = await prisma.address.update({ where: { id }, data });
  res.json({ success: true, data: address });
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const existingAddress = await prisma.address.findFirst({
    where: { id, userId: req.user!.userId },
  });

  if (!existingAddress) {
    throw new AppError('Address not found', 404);
  }

  try {
    await prisma.address.delete({ where: { id } });
    res.json({ success: true, message: 'Address deleted' });
  } catch (error: any) {
    if (error.code === 'P2003') {
      throw new AppError('Cannot delete address because it is linked to an existing order.', 400);
    }
    throw error;
  }
};

export const getAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({
    success: true,
    data: users,
  });
};

export const updateUserRole = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: { role },
  });

  res.json({
    success: true,
    data: user,
  });
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  await prisma.user.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: "User deleted",
  });
};
export const getNotificationPreferences = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {

  console.log("REQ USER =>", req.user);

  const user = await prisma.user.findUnique({
    where: {
      id: req.user!.userId,
    },
    select: {
      emailNotifications: true,
      offerNotifications: true,
      newArrivalNotifications: true,
      blogNotifications: true,
      restockNotifications: true,
    },
  });

  res.json({
    success: true,
    data: user,
  });
};

export const updateNotificationPreferences = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const updatedUser = await prisma.user.update({
    where: {
      id: req.user!.userId,
    },
    data: {
      emailNotifications:
        req.body.emailNotifications,

      offerNotifications:
        req.body.offerNotifications,

      newArrivalNotifications:
        req.body.newArrivalNotifications,

      blogNotifications:
        req.body.blogNotifications,

      restockNotifications:
        req.body.restockNotifications,
    },
    select: {
      emailNotifications: true,
      offerNotifications: true,
      newArrivalNotifications: true,
      blogNotifications: true,
      restockNotifications: true,
    },
  });

  res.json({
    success: true,
    data: updatedUser,
  });
};