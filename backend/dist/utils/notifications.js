"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyOrderStatus = exports.emailTransporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const twilio_1 = __importDefault(require("twilio"));
const prisma_1 = require("../db/prisma");
exports.emailTransporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;
const STATUS_COPY = {
    PENDING: {
        title: 'Order Placed',
        message: (ctx) => `Your order ${ctx.orderNumber} has been placed successfully. We'll notify you as it progresses.`,
    },
    CONFIRMED: {
        title: 'Order Confirmed',
        message: (ctx) => `Your order ${ctx.orderNumber} has been confirmed and will be processed shortly.`,
    },
    PROCESSING: {
        title: 'Order Processing',
        message: (ctx) => `Your order ${ctx.orderNumber} is now being processed.`,
    },
    SHIPPED: {
        title: 'Order Shipped',
        message: (ctx) => `Your order ${ctx.orderNumber} has been shipped${ctx.courier ? ` via ${ctx.courier}` : ''}${ctx.awbNumber ? ` (AWB: ${ctx.awbNumber})` : ''}.`,
    },
    OUT_FOR_DELIVERY: {
        title: 'Out for Delivery',
        message: (ctx) => `Your order ${ctx.orderNumber} is out for delivery and will arrive soon.`,
    },
    DELIVERED: {
        title: 'Order Delivered',
        message: (ctx) => `Your order ${ctx.orderNumber} has been delivered. Thank you for shopping with HairsUp!`,
    },
    CANCELLED: {
        title: 'Order Cancelled',
        message: (ctx) => `Your order ${ctx.orderNumber} has been cancelled.`,
    },
};
const formatWhatsAppNumber = (phone) => {
    const digits = phone.replace(/\D/g, '');
    const withCountryCode = digits.length === 10 ? `91${digits}` : digits;
    return `whatsapp:+${withCountryCode}`;
};
const sendStatusEmail = async (to, firstName, title, message, order) => {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD)
        return;
    try {
        const itemsHtml = order.items
            .map((item) => `<tr><td style="padding:6px 0;">${item.name} × ${item.quantity}</td><td style="padding:6px 0;text-align:right;">₹${(item.price * item.quantity).toFixed(2)}</td></tr>`)
            .join('');
        await exports.emailTransporter.sendMail({
            from: `"HairsUp" <${process.env.GMAIL_USER}>`,
            to,
            subject: `${title} — ${order.orderNumber}`,
            html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#1f2937;">
          <h2>${title}</h2>
          <p>Hi ${firstName}, ${message}</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsHtml}</table>
          <p style="font-size:16px;"><strong>Total: ₹${order.total.toFixed(2)}</strong></p>
          <p>Shipping to:<br/>${order.address.fullName}<br/>${order.address.line1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}</p>
        </div>
      `,
        });
    }
    catch (err) {
        console.error(`Failed to send "${title}" email:`, err);
    }
};
const sendStatusWhatsApp = async (phone, title, message, order) => {
    if (!twilioClient || !process.env.TWILIO_WHATSAPP_NUMBER)
        return;
    try {
        await twilioClient.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: formatWhatsAppNumber(phone),
            body: `*${title}*\n\nOrder: ${order.orderNumber}\n${message}\n\nTotal: ₹${order.total.toFixed(2)}\n\nThank you for shopping with HairsUp!`,
        });
    }
    catch (err) {
        console.error(`Failed to send "${title}" WhatsApp message:`, err);
    }
};
const notifyOrderStatus = (user, address, order, status) => {
    const copy = STATUS_COPY[status];
    if (!copy)
        return;
    const message = copy.message({ orderNumber: order.orderNumber, courier: order.courier, awbNumber: order.awbNumber });
    prisma_1.prisma.notification
        .create({
        data: { userId: user.id, orderId: order.id, title: copy.title, message, status },
    })
        .catch((err) => console.error('Failed to create in-app notification:', err));
    if (user.emailNotifications) {
        void sendStatusEmail(user.email, user.firstName, copy.title, message, {
            orderNumber: order.orderNumber,
            total: order.total,
            items: order.items,
            address,
        });
    }
    void sendStatusWhatsApp(address.phone, copy.title, message, { orderNumber: order.orderNumber, total: order.total });
};
exports.notifyOrderStatus = notifyOrderStatus;
//# sourceMappingURL=notifications.js.map