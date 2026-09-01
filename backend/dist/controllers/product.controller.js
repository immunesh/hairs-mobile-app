"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getRelatedProducts = exports.getFeaturedProducts = exports.getCategories = exports.getProductById = exports.getProducts = void 0;
const prisma_1 = require("../db/prisma");
const error_middleware_1 = require("../middleware/error.middleware");
const getProducts = async (req, res) => {
    const { page = "1", limit = "12", gender, category, minPrice, maxPrice, sort = "createdAt", order = "desc", featured, bestSeller, newArrival, search, images, texture, sale, } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const where = {
        isActive: true,
    };
    if (gender)
        where.gender = gender.toUpperCase();
    if (featured === "true")
        where.isFeatured = true;
    if (bestSeller === "true")
        where.isBestSeller = true;
    if (newArrival === "true")
        where.isNewArrival = true;
    if (category)
        where.category = { slug: category };
    if (texture)
        where.texture = { in: texture.split(",") };
    if (sale === "true")
        where.salePrice = { not: null };
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { description: { contains: search } },
            { tags: { contains: search } },
        ];
    }
    if (minPrice || maxPrice) {
        where.basePrice = {};
        if (minPrice) {
            where.basePrice.gte = parseFloat(minPrice);
        }
        if (maxPrice) {
            where.basePrice.lte = parseFloat(maxPrice);
        }
    }
    const orderBy = {};
    orderBy[sort] = order;
    const [products, total] = await Promise.all([
        prisma_1.prisma.product.findMany({
            where,
            include: {
                images: true,
                category: {
                    select: {
                        name: true,
                        slug: true,
                        gender: true,
                    },
                },
                variants: true,
                includedItems: true,
                faqs: true,
                careGuides: true,
                features: true,
                highlights: true,
            },
            skip,
            take: limitNum,
            orderBy,
        }),
        prisma_1.prisma.product.count({ where }),
    ]);
    const parsed = products.map((p) => ({
        ...p,
        tags: safeParseJson(p.tags, []),
    }));
    res.json({
        success: true,
        data: parsed,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
        },
    });
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    const { id } = req.params;
    const product = await prisma_1.prisma.product.findFirst({
        where: {
            OR: [{ id }, { slug: id }],
            isActive: true,
        },
        include: {
            images: {
                orderBy: {
                    angle: "asc",
                },
            },
            includedItems: true,
            faqs: true,
            careGuides: true,
            category: true,
            variants: true,
            highlights: true,
            features: true,
            reviews: {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 10,
            },
        },
    });
    if (!product) {
        throw new error_middleware_1.AppError("Product not found", 404);
    }
    res.json({
        success: true,
        data: {
            ...product,
            tags: safeParseJson(product.tags, []),
            reviews: product.reviews.map((r) => ({
                ...r,
                images: safeParseJson(r.images, []),
            })),
        },
    });
};
exports.getProductById = getProductById;
const getCategories = async (req, res) => {
    const categories = await prisma_1.prisma.category.findMany({
        where: {
            parentId: null,
        },
        include: {
            children: true,
            _count: {
                select: {
                    products: true,
                },
            },
        },
    });
    res.json({
        success: true,
        data: categories,
    });
};
exports.getCategories = getCategories;
const getFeaturedProducts = async (req, res) => {
    const products = await prisma_1.prisma.product.findMany({
        where: {
            isFeatured: true,
            isActive: true,
        },
        include: {
            images: {
                where: {
                    isPrimary: true,
                },
                take: 1,
            },
            category: {
                select: {
                    name: true,
                    gender: true,
                },
            },
        },
        take: 8,
    });
    res.json({
        success: true,
        data: products.map((p) => ({
            ...p,
            tags: safeParseJson(p.tags, []),
        })),
    });
};
exports.getFeaturedProducts = getFeaturedProducts;
const getRelatedProducts = async (req, res) => {
    const { id } = req.params;
    const product = await prisma_1.prisma.product.findUnique({
        where: { id },
    });
    if (!product) {
        throw new error_middleware_1.AppError("Product not found", 404);
    }
    const related = await prisma_1.prisma.product.findMany({
        where: {
            categoryId: product.categoryId,
            gender: product.gender,
            id: {
                not: id,
            },
            isActive: true,
        },
        include: {
            images: {
                where: {
                    isPrimary: true,
                },
                take: 1,
            },
        },
        take: 6,
    });
    res.json({
        success: true,
        data: related.map((p) => ({
            ...p,
            tags: safeParseJson(p.tags, []),
        })),
    });
};
exports.getRelatedProducts = getRelatedProducts;
/* -------------------- ADMIN CRUD -------------------- */
const createProduct = async (req, res) => {
    try {
        console.log(req.body);
        const { name, slug, shortDesc, description, categoryId, gender, basePrice, salePrice, stock, sku, brand, tags, images, material, capSize, length, density, texture, color, rating, isFeatured, isBestSeller, isNewArrival, features, faqs, careGuides, includedItems, } = req.body;
        console.log("IMAGES RECEIVED:");
        console.log(images);
        const product = await prisma_1.prisma.product.create({
            data: {
                name,
                slug,
                description,
                shortDesc,
                material,
                capSize,
                length,
                density,
                texture,
                color,
                rating: Number(rating || 0),
                isFeatured,
                isBestSeller,
                isNewArrival,
                tags: JSON.stringify(Array.isArray(tags)
                    ? tags
                    : []),
                categoryId,
                gender,
                basePrice: Number(basePrice),
                salePrice: salePrice
                    ? Number(salePrice)
                    : null,
                stock: Number(stock),
                sku,
                brand: brand || "HairsUp",
                images: {
                    create: Array.isArray(images)
                        ? images.map((url, index) => ({
                            url,
                            isPrimary: index === 0,
                        }))
                        : [],
                },
                features: {
                    create: Array.isArray(features)
                        ? features
                        : [],
                },
                faqs: {
                    create: Array.isArray(faqs)
                        ? faqs
                        : [],
                },
                careGuides: {
                    create: Array.isArray(careGuides)
                        ? careGuides
                        : [],
                },
                includedItems: {
                    create: Array.isArray(includedItems)
                        ? includedItems
                        : [],
                },
            },
            include: {
                images: true,
                features: true,
                faqs: true,
                careGuides: true,
                includedItems: true,
            },
        });
        res.status(201).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        console.error("CREATE PRODUCT ERROR:");
        console.error(error);
        res.status(500).json({
            success: false,
            message: error?.message ||
                "Failed to create product",
        });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, slug, shortDesc, description, categoryId, gender, basePrice, salePrice, stock, sku, brand, tags, images, material, capSize, length, density, texture, color, rating, isFeatured, isBestSeller, isNewArrival, features, faqs, careGuides, includedItems, } = req.body;
    // Delete old images
    await prisma_1.prisma.productImage.deleteMany({
        where: {
            productId: id,
        },
    });
    await prisma_1.prisma.productFeature.deleteMany({
        where: {
            productId: id,
        },
    });
    await prisma_1.prisma.productFAQ.deleteMany({
        where: {
            productId: id,
        },
    });
    await prisma_1.prisma.careGuide.deleteMany({
        where: {
            productId: id,
        },
    });
    await prisma_1.prisma.includedItem.deleteMany({
        where: {
            productId: id,
        },
    });
    const product = await prisma_1.prisma.product.update({
        where: { id },
        data: {
            name,
            slug,
            shortDesc,
            description,
            categoryId,
            gender,
            material,
            capSize,
            length,
            density,
            texture,
            color,
            rating: Number(rating || 0),
            isFeatured,
            isBestSeller,
            isNewArrival,
            basePrice: Number(basePrice),
            salePrice: salePrice
                ? Number(salePrice)
                : null,
            stock: Number(stock),
            sku,
            brand,
            tags: JSON.stringify(Array.isArray(tags)
                ? tags
                : typeof tags === "string"
                    ? tags
                        .split(",")
                        .map((t) => t.trim())
                    : []),
            images: {
                create: Array.isArray(images)
                    ? images.map((url, index) => ({
                        url,
                        isPrimary: index === 0,
                    }))
                    : [],
            },
            features: {
                create: Array.isArray(features)
                    ? features
                    : [],
            },
            faqs: {
                create: Array.isArray(faqs)
                    ? faqs
                    : [],
            },
            careGuides: {
                create: Array.isArray(careGuides)
                    ? careGuides
                    : [],
            },
            includedItems: {
                create: Array.isArray(includedItems)
                    ? includedItems
                    : [],
            },
        },
        include: {
            images: true,
            features: true,
            faqs: true,
            careGuides: true,
            includedItems: true,
        },
    });
    res.json({
        success: true,
        data: product,
    });
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.product.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: "Product deleted",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete product",
        });
    }
};
exports.deleteProduct = deleteProduct;
function safeParseJson(val, fallback) {
    try {
        return JSON.parse(val);
    }
    catch {
        return fallback;
    }
}
//# sourceMappingURL=product.controller.js.map