"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoupon = exports.applyCoupon = exports.toggleCouponStatus = exports.createCoupon = exports.getAllCoupons = void 0;
const prisma_1 = require("../db/prisma");
const getAllCoupons = async (req, res) => {
    const coupons = await prisma_1.prisma.coupon.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
    res.json({
        success: true,
        data: coupons,
    });
};
exports.getAllCoupons = getAllCoupons;
const createCoupon = async (req, res) => {
    const { code, type, value, minOrder, maxDiscount, usageLimit, expiresAt, } = req.body;
    const coupon = await prisma_1.prisma.coupon.create({
        data: {
            code: code.toUpperCase(),
            type,
            value,
            minOrder,
            maxDiscount,
            usageLimit,
            expiresAt: expiresAt
                ? new Date(expiresAt)
                : null,
        },
    });
    res.status(201).json({
        success: true,
        data: coupon,
    });
};
exports.createCoupon = createCoupon;
const toggleCouponStatus = async (req, res) => {
    const { id } = req.params;
    const coupon = await prisma_1.prisma.coupon.findUnique({
        where: { id },
    });
    if (!coupon) {
        res.status(404).json({
            success: false,
            message: "Coupon not found",
        });
        return;
    }
    const updated = await prisma_1.prisma.coupon.update({
        where: { id },
        data: {
            isActive: !coupon.isActive,
        },
    });
    res.json({
        success: true,
        data: updated,
    });
};
exports.toggleCouponStatus = toggleCouponStatus;
const applyCoupon = async (req, res) => {
    const { code, subtotal } = req.body;
    const coupon = await prisma_1.prisma.coupon.findFirst({
        where: {
            code: code.toUpperCase(),
            isActive: true,
        },
    });
    if (!coupon) {
        res.status(404).json({
            success: false,
            message: "Invalid coupon",
        });
        return;
    }
    if (coupon.expiresAt &&
        coupon.expiresAt < new Date()) {
        res.status(400).json({
            success: false,
            message: "Coupon expired",
        });
        return;
    }
    if (coupon.minOrder &&
        subtotal < coupon.minOrder) {
        res.status(400).json({
            success: false,
            message: `Minimum order ₹${coupon.minOrder}`,
        });
        return;
    }
    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
        discount =
            (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount &&
            discount > coupon.maxDiscount) {
            discount =
                coupon.maxDiscount;
        }
    }
    else {
        discount = coupon.value;
    }
    res.json({
        success: true,
        data: {
            coupon,
            discount,
        },
    });
};
exports.applyCoupon = applyCoupon;
const deleteCoupon = async (req, res) => {
    const { id } = req.params;
    await prisma_1.prisma.coupon.delete({
        where: { id },
    });
    res.json({
        success: true,
        message: "Coupon deleted successfully",
    });
};
exports.deleteCoupon = deleteCoupon;
//# sourceMappingURL=coupon.controller.js.map