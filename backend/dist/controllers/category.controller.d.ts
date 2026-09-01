import { Request, Response } from "express";
export declare const getCategories: (req: Request, res: Response) => Promise<void>;
export declare const getCategoryById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createCategory: (req: Request, res: Response) => Promise<void>;
export declare const updateCategory: (req: Request, res: Response) => Promise<void>;
export declare const deleteCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=category.controller.d.ts.map