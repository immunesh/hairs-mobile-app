import { Response } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  const wishlist = await prisma.wishlistItem.findMany({
    where: { userId: req.user!.userId },
    include: {
      product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
    },
  });
  res.json({ success: true, data: wishlist });
};

export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.body;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found', 404);

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: req.user!.userId, productId } },
  });
  if (existing) {
    res.json({ success: true, message: 'Already in wishlist' });
    return;
  }

  const item = await prisma.wishlistItem.create({
    data: { userId: req.user!.userId, productId },
    include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
  });
  res.status(201).json({ success: true, data: item });
};

export const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;
  await prisma.wishlistItem.deleteMany({
    where: { userId: req.user!.userId, productId },
  });
  res.json({ success: true, message: 'Removed from wishlist' });
};

export const getAllWishlists = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const wishlists = await prisma.wishlistItem.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      product: {
        include: {
          images: {
            where: {
              isPrimary: true,
            },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({
    success: true,
    data: wishlists,
  });
};