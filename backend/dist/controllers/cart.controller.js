"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCarts = exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const prisma_1 = require("../db/prisma");
const error_middleware_1 = require("../middleware/error.middleware");
/* ===========================
   USER CART
=========================== */
const getCart = async (req, res) => {
    const cart = await prisma_1.prisma.cartItem.findMany({
        where: {
            userId: req.user.userId,
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
exports.getCart = getCart;
const addToCart = async (req, res) => {
    const { productId, quantity = 1, variant } = req.body;
    const product = await prisma_1.prisma.product.findUnique({
        where: { id: productId },
    });
    if (!product) {
        throw new error_middleware_1.AppError("Product not found", 404);
    }
    if (product.stock < quantity) {
        throw new error_middleware_1.AppError("Insufficient stock", 400);
    }
    const existing = await prisma_1.prisma.cartItem.findUnique({
        where: {
            userId_productId: {
                userId: req.user.userId,
                productId,
            },
        },
    });
    const variantStr = variant
        ? JSON.stringify(variant)
        : null;
    if (existing) {
        const updated = await prisma_1.prisma.cartItem.update({
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
    const item = await prisma_1.prisma.cartItem.create({
        data: {
            userId: req.user.userId,
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
exports.addToCart = addToCart;
const updateCartItem = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    if (quantity <= 0) {
        await prisma_1.prisma.cartItem.delete({
            where: {
                id,
                userId: req.user.userId,
            },
        });
        res.json({
            success: true,
            message: "Item removed from cart",
        });
        return;
    }
    const updated = await prisma_1.prisma.cartItem.update({
        where: {
            id,
            userId: req.user.userId,
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
exports.updateCartItem = updateCartItem;
const removeFromCart = async (req, res) => {
    const { id } = req.params;
    await prisma_1.prisma.cartItem.delete({
        where: {
            id,
            userId: req.user.userId,
        },
    });
    res.json({
        success: true,
        message: "Item removed from cart",
    });
};
exports.removeFromCart = removeFromCart;
const clearCart = async (req, res) => {
    await prisma_1.prisma.cartItem.deleteMany({
        where: {
            userId: req.user.userId,
        },
    });
    res.json({
        success: true,
        message: "Cart cleared",
    });
};
exports.clearCart = clearCart;
/* ===========================
   ADMIN CART MANAGEMENT
=========================== */
const getAllCarts = async (req, res) => {
    const carts = await prisma_1.prisma.cartItem.findMany({
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
exports.getAllCarts = getAllCarts;
//# sourceMappingURL=cart.controller.js.map