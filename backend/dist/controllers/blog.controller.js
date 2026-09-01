"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.togglePublishBlog = exports.deleteBlog = exports.updateBlog = exports.createBlog = exports.getBlogById = exports.getPublishedBlogs = exports.getAllBlogs = void 0;
const prisma_1 = require("../db/prisma");
const getAllBlogs = async (req, res) => {
    const blogs = await prisma_1.prisma.blogPost.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
    res.json({
        success: true,
        data: blogs,
    });
};
exports.getAllBlogs = getAllBlogs;
const getPublishedBlogs = async (req, res) => {
    const blogs = await prisma_1.prisma.blogPost.findMany({
        where: {
            isPublished: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    res.json({
        success: true,
        data: blogs,
    });
};
exports.getPublishedBlogs = getPublishedBlogs;
const getBlogById = async (req, res) => {
    const { id } = req.params;
    const blog = await prisma_1.prisma.blogPost.findUnique({
        where: { id },
    });
    if (!blog) {
        res.status(404).json({
            success: false,
            message: "Blog not found",
        });
        return;
    }
    res.json({
        success: true,
        data: blog,
    });
};
exports.getBlogById = getBlogById;
const createBlog = async (req, res) => {
    const { title, slug, excerpt, content, image, author, tags, } = req.body;
    const blog = await prisma_1.prisma.blogPost.create({
        data: {
            title,
            slug,
            excerpt,
            content,
            image,
            author,
            tags: JSON.stringify(tags || []),
        },
    });
    res.status(201).json({
        success: true,
        data: blog,
    });
};
exports.createBlog = createBlog;
const updateBlog = async (req, res) => {
    const { id } = req.params;
    const blog = await prisma_1.prisma.blogPost.update({
        where: { id },
        data: req.body,
    });
    res.json({
        success: true,
        data: blog,
    });
};
exports.updateBlog = updateBlog;
const deleteBlog = async (req, res) => {
    const { id } = req.params;
    await prisma_1.prisma.blogPost.delete({
        where: { id },
    });
    res.json({
        success: true,
        message: "Blog deleted",
    });
};
exports.deleteBlog = deleteBlog;
const togglePublishBlog = async (req, res) => {
    const { id } = req.params;
    const blog = await prisma_1.prisma.blogPost.findUnique({
        where: { id },
    });
    if (!blog) {
        res.status(404).json({
            success: false,
            message: "Blog not found",
        });
        return;
    }
    const updated = await prisma_1.prisma.blogPost.update({
        where: { id },
        data: {
            isPublished: !blog.isPublished,
            publishedAt: !blog.isPublished
                ? new Date()
                : null,
        },
    });
    res.json({
        success: true,
        data: updated,
    });
};
exports.togglePublishBlog = togglePublishBlog;
//# sourceMappingURL=blog.controller.js.map