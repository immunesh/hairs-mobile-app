import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const createOrder: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getOrders: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getOrderById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const cancelOrder: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAdminOrders: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAdminOrderById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateOrderStatus: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createShipment: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateShipment: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=order.controller.d.ts.map