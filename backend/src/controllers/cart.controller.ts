import { Response } from "express";
import { prisma } from "../db/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";

/* ===========================
   USER CART
=========================== */

export const getCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const cart = await prisma.cartItem.findMany({
    where: {
      userId: req.user!.userId,
    },
    include: {
      product: {
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      },
    },
  });

  res.json({
    success: true,
    data: cart,
  });
};

export const addToCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { productId, quantity = 1, variant } = req.body;

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (product.stock < quantity) {
    throw new AppError("Insufficient stock", 400);
  }

  const existing = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId: req.user!.userId,
        productId,
      },
    },
  });

  const variantStr = variant
    ? JSON.stringify(variant)
    : null;

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: {
        id: existing.id,
      },
      data: {
        quantity: existing.quantity + quantity,
      },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: updated,
    });

    return;
  }

  const item = await prisma.cartItem.create({
    data: {
      userId: req.user!.userId,
      productId,
      quantity,
      variant: variantStr,
    },
    include: {
      product: {
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: item,
  });
};

export const updateCartItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: {
        id,
        userId: req.user!.userId,
      },
    });

    res.json({
      success: true,
      message: "Item removed from cart",
    });

    return;
  }

  const updated = await prisma.cartItem.update({
    where: {
      id,
      userId: req.user!.userId,
    },
    data: {
      quantity,
    },
    include: {
      product: {
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      },
    },
  });

  res.json({
    success: true,
    data: updated,
  });
};

export const removeFromCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  await prisma.cartItem.delete({
    where: {
      id,
      userId: req.user!.userId,
    },
  });

  res.json({
    success: true,
    message: "Item removed from cart",
  });
};

export const clearCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  await prisma.cartItem.deleteMany({
    where: {
      userId: req.user!.userId,
    },
  });

  res.json({
    success: true,
    message: "Cart cleared",
  });
};

/* ===========================
   ADMIN CART MANAGEMENT
=========================== */

export const getAllCarts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const carts = await prisma.cartItem.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
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
    data: carts,
  });
};