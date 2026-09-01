"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getCategories = void 0;
const prisma_1 = require("../db/prisma");
const getCategories = async (req, res) => {
    try {
        const categories = await prisma_1.prisma.category.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });
        res.json(categories);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch categories",
        });
    }
};
exports.getCategories = getCategories;
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await prisma_1.prisma.category.findUnique({
            where: {
                id,
            },
        });
        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }
        res.json(category);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch category",
        });
    }
};
exports.getCategoryById = getCategoryById;
const createCategory = async (req, res) => {
    try {
        const { name, slug, description, gender, image } = req.body;
        const category = await prisma_1.prisma.category.create({
            data: {
                name,
                slug,
                description,
                gender,
                image,
            },
        });
        res.status(201).json(category);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create category",
        });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, gender, image } = req.body;
        const category = await prisma_1.prisma.category.update({
            where: {
                id,
            },
            data: {
                name,
                slug,
                description,
                gender,
                image,
            },
        });
        res.json(category);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update category",
        });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.category.delete({
            where: {
                id,
            },
        });
        res.json({
            success: true,
            message: "Category deleted",
        });
    }
    catch (error) {
        console.error(error);
        if (error.code === "P2003") {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category because products are assigned to it.",
            });
        }
        res.status(500).json({
            success: false,
            message: "Failed to delete category",
        });
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=category.controller.js.map