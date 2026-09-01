import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getWishlist: (req: AuthRequest, res: Response) => Promise<void>;
export declare const addToWishlist: (req: AuthRequest, res: Response) => Promise<void>;
export declare const removeFromWishlist: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllWishlists: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=wishlist.controller.d.ts.map