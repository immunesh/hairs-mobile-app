"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDeleteReview = exports.getTestimonials = exports.getMyReviews = exports.getAllReviews = exports.deleteReview = exports.updateReview = exports.createReview = exports.getProductReviews = void 0;
const prisma_1 = require("../db/prisma");
const error_middleware_1 = require("../middleware/error.middleware");
const getProductReviews = async (req, res) => {
    const { productId } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const [reviews, total] = await Promise.all([
        prisma_1.prisma.review.findMany({
            where: { productId },
            include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
            orderBy: { createdAt: 'desc' },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
        }),
        prisma_1.prisma.review.count({ where: { productId } }),
    ]);
    const stats = await prisma_1.prisma.review.aggregate({
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
exports.getProductReviews = getProductReviews;
const createReview = async (req, res) => {
    const { productId, rating, title, body, images } = req.body;
    const existing = await prisma_1.prisma.review.findUnique({
        where: { userId_productId: { userId: req.user.userId, productId } },
    });
    if (existing)
        throw new error_middleware_1.AppError('You have already reviewed this product', 409);
    const review = await prisma_1.prisma.review.create({
        data: {
            userId: req.user.userId,
            productId,
            rating,
            title,
            body,
            images: JSON.stringify(images || []),
        },
        include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
    });
    const stats = await prisma_1.prisma.review.aggregate({ where: { productId }, _avg: { rating: true }, _count: true });
    await prisma_1.prisma.product.update({
        where: { id: productId },
        data: { rating: stats._avg.rating || 0, reviewCount: stats._count },
    });
    res.status(201).json({ success: true, data: { ...review, images: safeParseJson(review.images, []) } });
};
exports.createReview = createReview;
const updateReview = async (req, res) => {
    const { id } = req.params;
    const { rating, title, body } = req.body;
    const review = await prisma_1.prisma.review.update({
        where: { id, userId: req.user.userId },
        data: { rating, title, body },
        include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
    });
    res.json({ success: true, data: { ...review, images: safeParseJson(review.images, []) } });
};
exports.updateReview = updateReview;
const deleteReview = async (req, res) => {
    const { id } = req.params;
    await prisma_1.prisma.review.delete({ where: { id, userId: req.user.userId } });
    res.json({ success: true, message: 'Review deleted' });
};
exports.deleteReview = deleteReview;
function safeParseJson(val, fallback) {
    try {
        return JSON.parse(val);
    }
    catch {
        return fallback;
    }
}
const getAllReviews = async (req, res) => {
    const reviews = await prisma_1.prisma.review.findMany({
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
exports.getAllReviews = getAllReviews;
const getMyReviews = async (req, res) => {
    const reviews = await prisma_1.prisma.review.findMany({
        where: {
            userId: req.user.userId,
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
exports.getMyReviews = getMyReviews;
const getTestimonials = async (req, res) => {
    const reviews = await prisma_1.prisma.review.findMany({
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
exports.getTestimonials = getTestimonials;
const adminDeleteReview = async (req, res) => {
    const { id } = req.params;
    await prisma_1.prisma.review.delete({
        where: { id },
    });
    res.json({
        success: true,
        message: "Review deleted successfully",
    });
};
exports.adminDeleteReview = adminDeleteReview;
//# sourceMappingURL=review.controller.js.map