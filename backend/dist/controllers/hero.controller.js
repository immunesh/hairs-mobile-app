"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHeroSlide = exports.updateHeroSlide = exports.createHeroSlide = exports.getHeroSlideById = exports.getHeroSlides = void 0;
const prisma_1 = require("../db/prisma");
const getHeroSlides = async (req, res) => {
    try {
        const { active } = req.query;
        const heroSlides = await prisma_1.prisma.heroSlide.findMany({
            where: active === "true"
                ? { isActive: true }
                : undefined,
            orderBy: [
                { order: "asc" },
                { createdAt: "desc" },
            ],
        });
        res.json(heroSlides);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch hero slides",
        });
    }
};
exports.getHeroSlides = getHeroSlides;
const getHeroSlideById = async (req, res) => {
    try {
        const { id } = req.params;
        const heroSlide = await prisma_1.prisma.heroSlide.findUnique({
            where: {
                id,
            },
        });
        if (!heroSlide) {
            return res.status(404).json({
                message: "Hero slide not found",
            });
        }
        res.json(heroSlide);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch hero slide",
        });
    }
};
exports.getHeroSlideById = getHeroSlideById;
const createHeroSlide = async (req, res) => {
    try {
        const { headline, subheadline, description, image, badge, tag, cta, ctaLink, ctaSecondary, ctaSecondaryLink, accent, order, isActive, } = req.body;
        const heroSlide = await prisma_1.prisma.heroSlide.create({
            data: {
                headline,
                subheadline,
                description,
                image,
                badge,
                tag,
                cta,
                ctaLink,
                ctaSecondary,
                ctaSecondaryLink,
                accent,
                order: order !== undefined ? Number(order) : 0,
                isActive: isActive !== undefined ? Boolean(isActive) : true,
            },
        });
        res.status(201).json(heroSlide);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create hero slide",
        });
    }
};
exports.createHeroSlide = createHeroSlide;
const updateHeroSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const { headline, subheadline, description, image, badge, tag, cta, ctaLink, ctaSecondary, ctaSecondaryLink, accent, order, isActive, } = req.body;
        const heroSlide = await prisma_1.prisma.heroSlide.update({
            where: {
                id,
            },
            data: {
                headline,
                subheadline,
                description,
                image,
                badge,
                tag,
                cta,
                ctaLink,
                ctaSecondary,
                ctaSecondaryLink,
                accent,
                order: order !== undefined ? Number(order) : undefined,
                isActive: isActive !== undefined ? Boolean(isActive) : undefined,
            },
        });
        res.json(heroSlide);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update hero slide",
        });
    }
};
exports.updateHeroSlide = updateHeroSlide;
const deleteHeroSlide = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.heroSlide.delete({
            where: {
                id,
            },
        });
        res.json({
            success: true,
            message: "Hero slide deleted",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete hero slide",
        });
    }
};
exports.deleteHeroSlide = deleteHeroSlide;
//# sourceMappingURL=hero.controller.js.map