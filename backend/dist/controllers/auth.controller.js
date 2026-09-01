"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = exports.getMe = exports.logout = exports.refresh = exports.googleAuth = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const google_auth_library_1 = require("google-auth-library");
const prisma_1 = require("../db/prisma");
const jwt_1 = require("../utils/jwt");
const error_middleware_1 = require("../middleware/error.middleware");
const notifications_1 = require("../utils/notifications");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const register = async (req, res) => {
    const { email, password, firstName, lastName, phone } = req.body;
    const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new error_middleware_1.AppError('Email already registered', 409);
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    const user = await prisma_1.prisma.user.create({
        data: { email, password: hashedPassword, firstName, lastName, phone },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
    await prisma_1.prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    res.status(201).json({ success: true, data: { user, accessToken, refreshToken } });
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new error_middleware_1.AppError('Invalid credentials', 401);
    if (!user.password) {
        throw new error_middleware_1.AppError('This account uses Google Sign-In. Please continue with Google.', 401);
    }
    const valid = await bcryptjs_1.default.compare(password, user.password);
    if (!valid)
        throw new error_middleware_1.AppError('Invalid credentials', 401);
    const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
    await prisma_1.prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, data: { user: userWithoutPassword, accessToken, refreshToken } });
};
exports.login = login;
const googleAuth = async (req, res) => {
    const { credential } = req.body;
    if (!credential)
        throw new error_middleware_1.AppError('Google credential is required', 400);
    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email)
        throw new error_middleware_1.AppError('Invalid Google token', 401);
    const { sub: googleId, email, given_name, family_name, picture, email_verified } = payload;
    let user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        user = await prisma_1.prisma.user.create({
            data: {
                email,
                googleId,
                provider: 'google',
                firstName: given_name || 'User',
                lastName: family_name || '',
                avatar: picture,
                isVerified: !!email_verified,
            },
        });
    }
    else if (!user.googleId) {
        user = await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { googleId, avatar: user.avatar || picture },
        });
    }
    const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
    await prisma_1.prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, data: { user: userWithoutPassword, accessToken, refreshToken } });
};
exports.googleAuth = googleAuth;
const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken)
        throw new error_middleware_1.AppError('Refresh token required', 400);
    const stored = await prisma_1.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
        throw new error_middleware_1.AppError('Invalid or expired refresh token', 401);
    }
    const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
    const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user)
        throw new error_middleware_1.AppError('User not found', 404);
    await prisma_1.prisma.refreshToken.delete({ where: { token: refreshToken } });
    const newAccessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
    const newRefreshToken = (0, jwt_1.generateRefreshToken)(user.id);
    await prisma_1.prisma.refreshToken.create({
        data: {
            token: newRefreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
};
exports.refresh = refresh;
const logout = async (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
        await prisma_1.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ success: true, message: 'Logged out successfully' });
};
exports.logout = logout;
const getMe = async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
            id: true, email: true, firstName: true, lastName: true,
            phone: true, avatar: true, role: true, createdAt: true,
        },
    });
    if (!user)
        throw new error_middleware_1.AppError('User not found', 404);
    res.json({ success: true, data: user });
};
exports.getMe = getMe;
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new error_middleware_1.AppError('User with this email does not exist', 404);
    }
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcryptjs_1.default.hash(tempPassword, 12);
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
    });
    await notifications_1.emailTransporter.sendMail({
        from: `"HairsUp" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "HairsUp — Temporary Password",
        html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#1f2937;line-height:1.6;">
        <h2 style="color:#6B21A8;">Password Reset</h2>
        <p>Hi ${user.firstName},</p>
        <p>You requested a password reset for your HairsUp account.</p>
        <p>Your temporary password is: <strong style="font-size:18px;color:#6B21A8;background-color:#F3F4F6;padding:4px 8px;border-radius:4px;font-family:monospace;">${tempPassword}</strong></p>
        <p>Please log in using this temporary password and update it in your profile settings.</p>
      </div>
    `,
    });
    res.json({ success: true, message: 'Temporary password sent to email' });
};
exports.forgotPassword = forgotPassword;
//# sourceMappingURL=auth.controller.js.map