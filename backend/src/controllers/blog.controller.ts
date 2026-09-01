import { Request, Response } from "express";
import { prisma } from "../db/prisma";

export const getAllBlogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  const blogs = await prisma.blogPost.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({
    success: true,
    data: blogs,
  });
};

export const getPublishedBlogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  const blogs = await prisma.blogPost.findMany({
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
export const getBlogById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const blog = await prisma.blogPost.findUnique({
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

export const createBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    title,
    slug,
    excerpt,
    content,
    image,
    author,
    tags,
  } = req.body;

  const blog = await prisma.blogPost.create({
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

export const updateBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const blog = await prisma.blogPost.update({
    where: { id },
    data: req.body,
  });

  res.json({
    success: true,
    data: blog,
  });
};

export const deleteBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  await prisma.blogPost.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: "Blog deleted",
  });
};

export const togglePublishBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const blog = await prisma.blogPost.findUnique({
    where: { id },
  });

  if (!blog) {
    res.status(404).json({
      success: false,
      message: "Blog not found",
    });
    return;
  }

  const updated =
    await prisma.blogPost.update({
      where: { id },
      data: {
        isPublished:
          !blog.isPublished,
        publishedAt:
          !blog.isPublished
            ? new Date()
            : null,
      },
    });

  res.json({
    success: true,
    data: updated,
  });
};