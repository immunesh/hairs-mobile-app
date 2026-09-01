"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShipment = exports.createShipment = exports.updateOrderStatus = exports.getAdminOrderById = exports.getAdminOrders = exports.cancelOrder = exports.getOrderById = exports.getOrders = exports.createOrder = void 0;
const prisma_1 = require("../db/prisma");
const error_middleware_1 = require("../middleware/error.middleware");
const notifications_1 = require("../utils/notifications");
const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `HU-${timestamp}-${random}`;
};
// Valid forward status transitions. SHIPPED is reachable only through the
// dedicated shipment endpoints, which enforce that an AWB has been assigned.
const ALLOWED_STATUS_TRANSITIONS = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['CANCELLED'],
    SHIPPED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: [],
};
const STATUS_MESSAGES = {
    CONFIRMED: 'Order confirmed.',
    PROCESSING: 'Order is being processed.',
    OUT_FOR_DELIVERY: 'Order is out for delivery.',
    DELIVERED: 'Order delivered successfully.',
    CANCELLED: 'Order cancelled by admin.',
};
const validateShipmentPayload = (body) => {
    const courier = typeof body.courier === 'string' ? body.courier.trim() : '';
    const awbNumber = typeof body.awbNumber === 'string' ? body.awbNumber.trim() : '';
    const trackingUrl = typeof body.trackingUrl === 'string' ? body.trackingUrl.trim() : '';
    const estimatedDelivery = body.estimatedDelivery;
    if (!courier)
        throw new error_middleware_1.AppError('Courier is required', 400);
    if (!awbNumber)
        throw new error_middleware_1.AppError('AWB / Tracking number is required', 400);
    if (!estimatedDelivery || isNaN(new Date(estimatedDelivery).getTime())) {
        throw new error_middleware_1.AppError('A valid estimated delivery date is required', 400);
    }
    if (trackingUrl && !/^https?:\/\//i.test(trackingUrl)) {
        throw new error_middleware_1.AppError('Tracking URL must be a valid http/https URL', 400);
    }
    return { courier, awbNumber, trackingUrl: trackingUrl || null, estimatedDelivery: new Date(estimatedDelivery) };
};
const createOrder = async (req, res) => {
    const { addressId, paymentMethod, couponCode, notes } = req.body;
    const address = await prisma_1.prisma.address.findFirst({
        where: { id: addressId, userId: req.user.userId },
    });
    if (!address)
        throw new error_middleware_1.AppError('Address not found', 404);
    const cartItems = await prisma_1.prisma.cartItem.findMany({
        where: { userId: req.user.userId },
        include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
    });
    if (!cartItems.length)
        throw new error_middleware_1.AppError('Cart is empty', 400);
    let subtotal = 0;
    const orderItems = cartItems.map((item) => {
        const price = item.product.salePrice || item.product.basePrice;
        subtotal += price * item.quantity;
        return {
            productId: item.productId,
            name: item.product.name,
            image: item.product.images[0]?.url,
            quantity: item.quantity,
            price,
            variant: item.variant,
        };
    });
    let discount = 0;
    if (couponCode) {
        const coupon = await prisma_1.prisma.coupon.findFirst({ where: { code: couponCode, isActive: true } });
        if (coupon) {
            if (coupon.type === 'PERCENTAGE') {
                discount = (subtotal * coupon.value) / 100;
                if (coupon.maxDiscount)
                    discount = Math.min(discount, coupon.maxDiscount);
            }
            else {
                discount = coupon.value;
            }
        }
    }
    const shipping = subtotal > 999 ? 0 : 99;
    const tax = (subtotal - discount) * 0.18;
    const total = subtotal - discount + shipping + tax;
    const order = await prisma_1.prisma.order.create({
        data: {
            orderNumber: generateOrderNumber(),
            userId: req.user.userId,
            addressId,
            paymentMethod,
            subtotal,
            discount,
            shipping,
            tax,
            total,
            couponCode,
            notes,
            items: { create: orderItems },
            tracking: { create: { status: 'PENDING', message: 'Order placed successfully.' } },
        },
        include: { items: true, address: true, tracking: true },
    });
    await prisma_1.prisma.cartItem.deleteMany({ where: { userId: req.user.userId } });
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, email: true, firstName: true, emailNotifications: true },
    });
    if (user) {
        (0, notifications_1.notifyOrderStatus)(user, address, order, 'PENDING');
    }
    res.status(201).json({ success: true, data: order });
};
exports.createOrder = createOrder;
const getOrders = async (req, res) => {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const [orders, total] = await Promise.all([
        prisma_1.prisma.order.findMany({
            where: { userId: req.user.userId },
            include: { items: true, address: true },
            orderBy: { createdAt: 'desc' },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
        }),
        prisma_1.prisma.order.count({ where: { userId: req.user.userId } }),
    ]);
    res.json({
        success: true,
        data: orders,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
};
exports.getOrders = getOrders;
const getOrderById = async (req, res) => {
    const { id } = req.params;
    const order = await prisma_1.prisma.order.findFirst({
        where: { OR: [{ id }, { orderNumber: id }], userId: req.user.userId },
        include: { items: true, address: true, tracking: { orderBy: { createdAt: 'desc' } } },
    });
    if (!order)
        throw new error_middleware_1.AppError('Order not found', 404);
    res.json({ success: true, data: order });
};
exports.getOrderById = getOrderById;
const cancelOrder = async (req, res) => {
    const { id } = req.params;
    const order = await prisma_1.prisma.order.findFirst({ where: { id, userId: req.user.userId } });
    if (!order)
        throw new error_middleware_1.AppError('Order not found', 404);
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
        throw new error_middleware_1.AppError('Order cannot be cancelled at this stage', 400);
    }
    const updated = await prisma_1.prisma.order.update({
        where: { id },
        data: {
            status: 'CANCELLED',
            tracking: { create: { status: 'CANCELLED', message: 'Order cancelled by customer.' } },
        },
        include: {
            items: true,
            address: true,
            user: { select: { id: true, email: true, firstName: true, emailNotifications: true } },
        },
    });
    (0, notifications_1.notifyOrderStatus)(updated.user, updated.address, updated, 'CANCELLED');
    res.json({ success: true, message: 'Order cancelled successfully' });
};
exports.cancelOrder = cancelOrder;
const getAdminOrders = async (req, res) => {
    const orders = await prisma_1.prisma.order.findMany({
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            items: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    res.json({
        success: true,
        data: orders,
    });
};
exports.getAdminOrders = getAdminOrders;
const getAdminOrderById = async (req, res) => {
    const { id } = req.params;
    const order = await prisma_1.prisma.order.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
            address: true,
            items: true,
            tracking: {
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });
    if (!order) {
        throw new error_middleware_1.AppError("Order not found", 404);
    }
    res.json({
        success: true,
        data: order,
    });
};
exports.getAdminOrderById = getAdminOrderById;
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const existing = await prisma_1.prisma.order.findUnique({ where: { id } });
        if (!existing)
            throw new error_middleware_1.AppError('Order not found', 404);
        if (status === existing.status) {
            res.json({ success: true, data: existing });
            return;
        }
        if (status === 'SHIPPED') {
            throw new error_middleware_1.AppError('Use the Ship Order action to mark an order as shipped', 400);
        }
        const allowedNext = ALLOWED_STATUS_TRANSITIONS[existing.status] || [];
        if (!allowedNext.includes(status)) {
            throw new error_middleware_1.AppError(`Cannot change status from ${existing.status} to ${status}`, 400);
        }
        const order = await prisma_1.prisma.order.update({
            where: { id },
            data: {
                status,
                deliveredAt: status === 'DELIVERED' ? new Date() : existing.deliveredAt,
                tracking: {
                    create: {
                        status,
                        message: STATUS_MESSAGES[status] || `Order status updated to ${status}`,
                    },
                },
            },
            include: {
                items: true,
                address: true,
                tracking: { orderBy: { createdAt: 'desc' } },
                user: { select: { id: true, email: true, firstName: true, emailNotifications: true } },
            },
        });
        (0, notifications_1.notifyOrderStatus)(order.user, order.address, order, status);
        res.json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        console.error('Failed to update order status:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const createShipment = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma_1.prisma.order.findUnique({ where: { id } });
        if (!existing)
            throw new error_middleware_1.AppError('Order not found', 404);
        if (existing.status !== 'PROCESSING') {
            throw new error_middleware_1.AppError('Order must be in Processing status before it can be shipped', 400);
        }
        const { courier, awbNumber, trackingUrl, estimatedDelivery } = validateShipmentPayload(req.body);
        const notes = typeof req.body.notes === 'string' ? req.body.notes.trim() : '';
        const order = await prisma_1.prisma.order.update({
            where: { id },
            data: {
                status: 'SHIPPED',
                courier,
                awbNumber,
                trackingUrl,
                estimatedDelivery,
                shipmentNotes: notes || null,
                shippedAt: new Date(),
                tracking: {
                    create: {
                        status: 'SHIPPED',
                        message: `Order shipped via ${courier}. AWB: ${awbNumber}`,
                    },
                },
            },
            include: {
                items: true,
                address: true,
                tracking: { orderBy: { createdAt: 'desc' } },
                user: { select: { id: true, email: true, firstName: true, emailNotifications: true } },
            },
        });
        (0, notifications_1.notifyOrderStatus)(order.user, order.address, order, 'SHIPPED');
        res.status(201).json({ success: true, data: order });
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        console.error('Failed to create shipment:', error);
        res.status(500).json({ success: false, message: 'Failed to create shipment' });
    }
};
exports.createShipment = createShipment;
const updateShipment = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma_1.prisma.order.findUnique({ where: { id } });
        if (!existing)
            throw new error_middleware_1.AppError('Order not found', 404);
        if (!existing.awbNumber) {
            throw new error_middleware_1.AppError('Shipment has not been created for this order yet', 400);
        }
        const { courier, awbNumber, trackingUrl, estimatedDelivery } = validateShipmentPayload(req.body);
        const notes = typeof req.body.notes === 'string' ? req.body.notes.trim() : '';
        const order = await prisma_1.prisma.order.update({
            where: { id },
            data: {
                courier,
                awbNumber,
                trackingUrl,
                estimatedDelivery,
                shipmentNotes: notes || null,
                tracking: {
                    create: {
                        status: existing.status,
                        message: `Shipment details updated. Courier: ${courier}, AWB: ${awbNumber}`,
                    },
                },
            },
            include: { items: true, address: true, tracking: { orderBy: { createdAt: 'desc' } } },
        });
        res.json({ success: true, data: order });
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        console.error('Failed to update shipment:', error);
        res.status(500).json({ success: false, message: 'Failed to update shipment' });
    }
};
exports.updateShipment = updateShipment;
//# sourceMappingURL=order.controller.js.map