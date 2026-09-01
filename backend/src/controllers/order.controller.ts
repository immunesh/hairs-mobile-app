import { Response } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { notifyOrderStatus } from '../utils/notifications';

const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HU-${timestamp}-${random}`;
};

// Valid forward status transitions. SHIPPED is reachable only through the
// dedicated shipment endpoints, which enforce that an AWB has been assigned.
const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_MESSAGES: Record<string, string> = {
  CONFIRMED: 'Order confirmed.',
  PROCESSING: 'Order is being processed.',
  OUT_FOR_DELIVERY: 'Order is out for delivery.',
  DELIVERED: 'Order delivered successfully.',
  CANCELLED: 'Order cancelled by admin.',
};

const validateShipmentPayload = (body: Record<string, unknown>) => {
  const courier = typeof body.courier === 'string' ? body.courier.trim() : '';
  const awbNumber = typeof body.awbNumber === 'string' ? body.awbNumber.trim() : '';
  const trackingUrl = typeof body.trackingUrl === 'string' ? body.trackingUrl.trim() : '';
  const estimatedDelivery = body.estimatedDelivery as string | undefined;

  if (!courier) throw new AppError('Courier is required', 400);
  if (!awbNumber) throw new AppError('AWB / Tracking number is required', 400);
  if (!estimatedDelivery || isNaN(new Date(estimatedDelivery).getTime())) {
    throw new AppError('A valid estimated delivery date is required', 400);
  }
  if (trackingUrl && !/^https?:\/\//i.test(trackingUrl)) {
    throw new AppError('Tracking URL must be a valid http/https URL', 400);
  }

  return { courier, awbNumber, trackingUrl: trackingUrl || null, estimatedDelivery: new Date(estimatedDelivery) };
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { addressId, paymentMethod, couponCode, notes } = req.body;

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: req.user!.userId },
  });
  if (!address) throw new AppError('Address not found', 404);

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: req.user!.userId },
    include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
  });
  if (!cartItems.length) throw new AppError('Cart is empty', 400);

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
    const coupon = await prisma.coupon.findFirst({ where: { code: couponCode, isActive: true } });
    if (coupon) {
      if (coupon.type === 'PERCENTAGE') {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      } else {
        discount = coupon.value;
      }
    }
  }

  const shipping = subtotal > 999 ? 0 : 99;
  const tax = (subtotal - discount) * 0.18;
  const total = subtotal - discount + shipping + tax;

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: req.user!.userId,
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

  await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } });

  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, firstName: true, emailNotifications: true },
  });
  if (user) {
    notifyOrderStatus(user, address, order, 'PENDING');
  }

  res.status(201).json({ success: true, data: order });
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '10' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: req.user!.userId },
      include: { items: true, address: true },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.order.count({ where: { userId: req.user!.userId } }),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const order = await prisma.order.findFirst({
    where: { OR: [{ id }, { orderNumber: id }], userId: req.user!.userId },
    include: { items: true, address: true, tracking: { orderBy: { createdAt: 'desc' } } },
  });
  if (!order) throw new AppError('Order not found', 404);
  res.json({ success: true, data: order });
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const order = await prisma.order.findFirst({ where: { id, userId: req.user!.userId } });
  if (!order) throw new AppError('Order not found', 404);
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw new AppError('Order cannot be cancelled at this stage', 400);
  }
  const updated = await prisma.order.update({
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
  notifyOrderStatus(updated.user, updated.address, updated, 'CANCELLED');
  res.json({ success: true, message: 'Order cancelled successfully' });
};

export const getAdminOrders = async (
req: AuthRequest,
res: Response
): Promise<void> => {
const orders = await prisma.order.findMany({
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

export const getAdminOrderById = async (
req: AuthRequest,
res: Response
): Promise<void> => {
const { id } = req.params;

const order = await prisma.order.findUnique({
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
throw new AppError(
"Order not found",
404
);
}

res.json({
success: true,
data: order,
});
};

export const updateOrderStatus = async (
req: AuthRequest,
res: Response
): Promise<void> => {
try {

const { id } = req.params;
const { status } = req.body;

const existing = await prisma.order.findUnique({ where: { id } });
if (!existing) throw new AppError('Order not found', 404);

if (status === existing.status) {
  res.json({ success: true, data: existing });
  return;
}

if (status === 'SHIPPED') {
  throw new AppError('Use the Ship Order action to mark an order as shipped', 400);
}

const allowedNext = ALLOWED_STATUS_TRANSITIONS[existing.status] || [];
if (!allowedNext.includes(status)) {
  throw new AppError(`Cannot change status from ${existing.status} to ${status}`, 400);
}

const order = await prisma.order.update({
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

notifyOrderStatus(order.user, order.address, order, status);

res.json({
success: true,
data: order,
});
} catch (error) {
if (error instanceof AppError) {
res.status(error.statusCode).json({ success: false, message: error.message });
return;
}
console.error('Failed to update order status:', error);
res.status(500).json({ success: false, message: 'Failed to update order status' });
}
};

export const createShipment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw new AppError('Order not found', 404);

    if (existing.status !== 'PROCESSING') {
      throw new AppError('Order must be in Processing status before it can be shipped', 400);
    }

    const { courier, awbNumber, trackingUrl, estimatedDelivery } = validateShipmentPayload(req.body);
    const notes = typeof req.body.notes === 'string' ? req.body.notes.trim() : '';

    const order = await prisma.order.update({
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

    notifyOrderStatus(order.user, order.address, order, 'SHIPPED');

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error('Failed to create shipment:', error);
    res.status(500).json({ success: false, message: 'Failed to create shipment' });
  }
};

export const updateShipment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw new AppError('Order not found', 404);

    if (!existing.awbNumber) {
      throw new AppError('Shipment has not been created for this order yet', 400);
    }

    const { courier, awbNumber, trackingUrl, estimatedDelivery } = validateShipmentPayload(req.body);
    const notes = typeof req.body.notes === 'string' ? req.body.notes.trim() : '';

    const order = await prisma.order.update({
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
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error('Failed to update shipment:', error);
    res.status(500).json({ success: false, message: 'Failed to update shipment' });
  }
};

