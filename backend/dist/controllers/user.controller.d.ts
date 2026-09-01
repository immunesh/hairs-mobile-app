import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const changePassword: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAddresses: (req: AuthRequest, res: Response) => Promise<void>;
export declare const addAddress: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateAddress: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteAddress: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllUsers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateUserRole: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getNotificationPreferences: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateNotificationPreferences: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map