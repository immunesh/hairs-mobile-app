import { Request, Response } from "express";
import { prisma } from "../db/prisma";

export const getCategories = async (
  req: Request,
  res: Response
) => {
  try {
    const categories = await prisma.category.findMany({
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
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
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
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch category",
    });
  }
};

export const createCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, slug, description, gender, image } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        gender,
        image,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create category",
    });
  }
};

export const updateCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, slug, description, gender, image } = req.body;

    const category = await prisma.category.update({
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
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update category",
    });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({
      where: {
        id,
      },
    });

    res.json({
      success: true,
      message: "Category deleted",
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category because products are assigned to it.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};