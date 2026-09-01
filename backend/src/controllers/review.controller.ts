import { Response } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

export const getProductReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;
  const { page = '1', limit = '10' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.review.count({ where: { productId } }),
  ]);

  const stats = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  res.json({
    success: true,
    data: reviews.map((r) => ({ ...r, images: safeParseJson(r.images, []) })),
    stats: { avgRating: stats._avg.rating, totalReviews: stats._count.rating },
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, rating, title, body, images } = req.body;

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: req.user!.userId, productId } },
  });
  if (existing) throw new AppError('You have already reviewed this product', 409);

  const review = await prisma.review.create({
    data: {
      userId: req.user!.userId,
      productId,
      rating,
      title,
      body,
      images: JSON.stringify(images || []),
    },
    include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
  });

  const stats = await prisma.review.aggregate({ where: { productId }, _avg: { rating: true }, _count: true });
  await prisma.product.update({
    where: { id: productId },
    data: { rating: stats._avg.rating || 0, reviewCount: stats._count },
  });

  res.status(201).json({ success: true, data: { ...review, images: safeParseJson(review.images, []) } });
};

export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { rating, title, body } = req.body;
  const review = await prisma.review.update({
    where: { id, userId: req.user!.userId },
    data: { rating, title, body },
    include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
  });
  res.json({ success: true, data: { ...review, images: safeParseJson(review.images, []) } });
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.review.delete({ where: { id, userId: req.user!.userId } });
  res.json({ success: true, message: 'Review deleted' });
};

function safeParseJson(val: string, fallback: unknown) {
  try { return JSON.parse(val); } catch { return fallback; }
}

export const getAllReviews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const reviews = await prisma.review.findMany({
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      product: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({
    success: true,
    data: reviews,
  });
};
export const getMyReviews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const reviews = await prisma.review.findMany({
  where: {
    userId: req.user!.userId,
  },
  include: {
    user: {
      select: {
        firstName: true,
        lastName: true,
        avatar: true,
      },
    },
    product: {
      select: {
        id: true,
        name: true,
        slug: true,
        images: {
          where: {
            isPrimary: true,
          },
          select: {
            url: true,
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
    data: reviews.map((r) => ({
      ...r,
      images: safeParseJson(r.images, []),
    })),
  });
};
export const getTestimonials = async (req: AuthRequest, res: Response): Promise<void> => {
  const reviews = await prisma.review.findMany({
    where: { rating: { gte: 4 } },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          avatar: true,
          addresses: {
            select: { city: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      product: { select: { name: true, slug: true } },
    },
    orderBy: [{ rating: "desc" }, { helpfulCount: "desc" }, { createdAt: "desc" }],
    take: 8,
  });

  res.json({
    success: true,
    data: reviews.map((r) => ({
      ...r,
      images: safeParseJson(r.images, []),
      user: {
        firstName: r.user.firstName,
        lastName: r.user.lastName,
        avatar: r.user.avatar,
        city: r.user.addresses[0]?.city ?? null,
      },
    })),
  });
};

export const adminDeleteReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  await prisma.review.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: "Review deleted successfully",
  });
};