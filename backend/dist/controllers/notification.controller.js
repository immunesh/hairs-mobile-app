"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getUnreadCount = exports.getNotifications = void 0;
const prisma_1 = require("../db/prisma");
const getNotifications = async (req, res) => {
    const notifications = await prisma_1.prisma.notification.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
    res.json({ success: true, data: notifications });
};
exports.getNotifications = getNotifications;
const getUnreadCount = async (req, res) => {
    const count = await prisma_1.prisma.notification.count({
        where: { userId: req.user.userId, isRead: false },
    });
    res.json({ success: true, data: { count } });
};
exports.getUnreadCount = getUnreadCount;
const markAsRead = async (req, res) => {
    const { id } = req.params;
    await prisma_1.prisma.notification.updateMany({
        where: { id, userId: req.user.userId },
        data: { isRead: true },
    });
    res.json({ success: true });
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    await prisma_1.prisma.notification.updateMany({
        where: { userId: req.user.userId, isRead: false },
        data: { isRead: true },
    });
    res.json({ success: true });
};
exports.markAllAsRead = markAllAsRead;
//# sourceMappingURL=notification.controller.js.map