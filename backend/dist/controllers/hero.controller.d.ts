import { Request, Response } from "express";
export declare const getHeroSlides: (req: Request, res: Response) => Promise<void>;
export declare const getHeroSlideById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createHeroSlide: (req: Request, res: Response) => Promise<void>;
export declare const updateHeroSlide: (req: Request, res: Response) => Promise<void>;
export declare const deleteHeroSlide: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=hero.controller.d.ts.map