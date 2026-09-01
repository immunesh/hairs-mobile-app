import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getProductReviews: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createReview: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateReview: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteReview: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllReviews: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMyReviews: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getTestimonials: (req: AuthRequest, res: Response) => Promise<void>;
export declare const adminDeleteReview: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=review.controller.d.ts.map