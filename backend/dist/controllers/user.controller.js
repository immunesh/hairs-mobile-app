"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotificationPreferences = exports.getNotificationPreferences = exports.deleteUser = exports.updateUserRole = exports.getAllUsers = exports.deleteAddress = exports.updateAddress = exports.addAddress = exports.getAddresses = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../db/prisma");
const error_middleware_1 = require("../middleware/error.middleware");
const getProfile = async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
            id: true, email: true, firstName: true, lastName: true,
            phone: true, avatar: true, role: true, createdAt: true,
            addresses: true,
            _count: { select: { orders: true, wishlist: true, reviews: true } },
        },
    });
    if (!user)
        throw new error_middleware_1.AppError('User not found', 404);
    res.json({ success: true, data: user });
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    const { firstName, lastName, phone, avatar } = req.body;
    const user = await prisma_1.prisma.user.update({
        where: { id: req.user.userId },
        data: { firstName, lastName, phone, avatar },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true },
    });
    res.json({ success: true, data: user });
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma_1.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user)
        throw new error_middleware_1.AppError('User not found', 404);
    if (!user.password) {
        throw new error_middleware_1.AppError('This account uses Google Sign-In and has no password to change', 400);
    }
    const valid = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!valid)
        throw new error_middleware_1.AppError('Current password is incorrect', 400);
    const hashed = await bcryptjs_1.default.hash(newPassword, 12);
    await prisma_1.prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    res.json({ success: true, message: 'Password updated successfully' });
};
exports.changePassword = changePassword;
const getAddresses = async (req, res) => {
    const addresses = await prisma_1.prisma.address.findMany({ where: { userId: req.user.userId } });
    res.json({ success: true, data: addresses });
};
exports.getAddresses = getAddresses;
const addAddress = async (req, res) => {
    const { type, fullName, phone, line1, line2, city, state, pincode, country, isDefault } = req.body;
    if (isDefault) {
        await prisma_1.prisma.address.updateMany({
            where: { userId: req.user.userId },
            data: { isDefault: false },
        });
    }
    const address = await prisma_1.prisma.address.create({
        data: { userId: req.user.userId, type, fullName, phone, line1, line2, city, state, pincode, country, isDefault },
    });
    res.status(201).json({ success: true, data: address });
};
exports.addAddress = addAddress;
const updateAddress = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    if (data.isDefault) {
        await prisma_1.prisma.address.updateMany({ where: { userId: req.user.userId }, data: { isDefault: false } });
    }
    const existingAddress = await prisma_1.prisma.address.findFirst({
        where: { id, userId: req.user.userId },
    });
    if (!existingAddress) {
        throw new error_middleware_1.AppError('Address not found', 404);
    }
    const address = await prisma_1.prisma.address.update({ where: { id }, data });
    res.json({ success: true, data: address });
};
exports.updateAddress = updateAddress;
const deleteAddress = async (req, res) => {
    const { id } = req.params;
    const existingAddress = await prisma_1.prisma.address.findFirst({
        where: { id, userId: req.user.userId },
    });
    if (!existingAddress) {
        throw new error_middleware_1.AppError('Address not found', 404);
    }
    try {
        await prisma_1.prisma.address.delete({ where: { id } });
        res.json({ success: true, message: 'Address deleted' });
    }
    catch (error) {
        if (error.code === 'P2003') {
            throw new error_middleware_1.AppError('Cannot delete address because it is linked to an existing order.', 400);
        }
        throw error;
    }
};
exports.deleteAddress = deleteAddress;
const getAllUsers = async (req, res) => {
    const users = await prisma_1.prisma.user.findMany({
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
exports.getAllUsers = getAllUsers;
const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const user = await prisma_1.prisma.user.update({
        where: { id },
        data: { role },
    });
    res.json({
        success: true,
        data: user,
    });
};
exports.updateUserRole = updateUserRole;
const deleteUser = async (req, res) => {
    const { id } = req.params;
    await prisma_1.prisma.user.delete({
        where: { id },
    });
    res.json({
        success: true,
        message: "User deleted",
    });
};
exports.deleteUser = deleteUser;
const getNotificationPreferences = async (req, res) => {
    console.log("REQ USER =>", req.user);
    const user = await prisma_1.prisma.user.findUnique({
        where: {
            id: req.user.userId,
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
exports.getNotificationPreferences = getNotificationPreferences;
const updateNotificationPreferences = async (req, res) => {
    const updatedUser = await prisma_1.prisma.user.update({
        where: {
            id: req.user.userId,
        },
        data: {
            emailNotifications: req.body.emailNotifications,
            offerNotifications: req.body.offerNotifications,
            newArrivalNotifications: req.body.newArrivalNotifications,
            blogNotifications: req.body.blogNotifications,
            restockNotifications: req.body.restockNotifications,
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
exports.updateNotificationPreferences = updateNotificationPreferences;
//# sourceMappingURL=user.controller.js.map