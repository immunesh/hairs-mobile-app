"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllWishlists = exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = void 0;
const prisma_1 = require("../db/prisma");
const error_middleware_1 = require("../middleware/error.middleware");
const getWishlist = async (req, res) => {
    const wishlist = await prisma_1.prisma.wishlistItem.findMany({
        where: { userId: req.user.userId },
        include: {
            product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
        },
    });
    res.json({ success: true, data: wishlist });
};
exports.getWishlist = getWishlist;
const addToWishlist = async (req, res) => {
    const { productId } = req.body;
    const product = await prisma_1.prisma.product.findUnique({ where: { id: productId } });
    if (!product)
        throw new error_middleware_1.AppError('Product not found', 404);
    const existing = await prisma_1.prisma.wishlistItem.findUnique({
        where: { userId_productId: { userId: req.user.userId, productId } },
    });
    if (existing) {
        res.json({ success: true, message: 'Already in wishlist' });
        return;
    }
    const item = await prisma_1.prisma.wishlistItem.create({
        data: { userId: req.user.userId, productId },
        include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
    });
    res.status(201).json({ success: true, data: item });
};
exports.addToWishlist = addToWishlist;
const removeFromWishlist = async (req, res) => {
    const { productId } = req.params;
    await prisma_1.prisma.wishlistItem.deleteMany({
        where: { userId: req.user.userId, productId },
    });
    res.json({ success: true, message: 'Removed from wishlist' });
};
exports.removeFromWishlist = removeFromWishlist;
const getAllWishlists = async (req, res) => {
    const wishlists = await prisma_1.prisma.wishlistItem.findMany({
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
exports.getAllWishlists = getAllWishlists;
//# sourceMappingURL=wishlist.controller.js.map